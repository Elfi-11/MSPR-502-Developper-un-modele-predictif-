import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.preprocessing import LabelEncoder

# === PARAMÈTRES ===
YEAR_TO_PREDICT = 2025

# === CHARGEMENT DES MODÈLES ===
model_cases = joblib.load("ml_models/model_cases_rf.joblib")
model_deaths = joblib.load("ml_models/model_deaths_xgb.joblib")
model_geo = joblib.load("ml_models/model_spread_rf.joblib")

# === CHARGEMENT DES DONNÉES HISTORIQUES ===
data_path = "data/covid_processed.csv"
data = pd.read_csv(data_path, parse_dates=["date"])

# === PRÉPARATION ===
data["location_encoded"] = LabelEncoder().fit_transform(data["location"])
data["day"] = data["date"].dt.day
data["month"] = data["date"].dt.month
data["year"] = data["date"].dt.year
data["epidemic_phase"] = data["year"].apply(lambda y: 0 if y <= 2022 else 1)
data["days_since_start"] = (data["date"] - data["date"].min()).dt.days

data.sort_values(["location", "date"], inplace=True)
data["new_cases_rolling7"] = data.groupby("location")["new_cases"].transform(lambda x: x.rolling(7, min_periods=1).mean())
data["trend_new_cases"] = data.groupby("location")["new_cases"].transform(lambda x: x.diff(7))

# === DERNIÈRE VALEUR PAR PAYS ===
max_year = data["year"].max()

def get_last_valid_row(df, year):
    subset = df[df["year"] == year]
    if not subset.empty:
        return subset.sort_values("date").iloc[[-1]]
    else:
        return pd.DataFrame()

latest_data = (
    data.groupby("location", group_keys=False)
    .apply(lambda df: get_last_valid_row(df, max_year))
    .dropna(how="all")
    .reset_index(drop=True)
)

if latest_data.empty:
    print(f"❌ Aucun pays n'a de données pour l'année {max_year}")
    exit()

# === NETTOYAGE DES DONNÉES D'ENTRÉE ===
print(f"🧹 Nettoyage des données d'entrée...")
print(f"Avant nettoyage: {len(latest_data)} pays")
print(f"Pays disponibles: {sorted(latest_data['location'].unique())}")

# Remplacer les valeurs NaN par des valeurs par défaut
latest_data["new_cases"] = latest_data["new_cases"].fillna(0)
latest_data["new_deaths"] = latest_data["new_deaths"].fillna(0)
latest_data["new_cases_rolling7"] = latest_data["new_cases_rolling7"].fillna(0)
latest_data["trend_new_cases"] = latest_data["trend_new_cases"].fillna(0)

# Supprimer les lignes avec des valeurs critiques manquantes
latest_data = latest_data.dropna(subset=["total_cases", "total_deaths", "location_encoded"])

print(f"Après nettoyage: {len(latest_data)} pays")
print(f"Pays retenus après nettoyage: {sorted(latest_data['location'].unique())}")

def post_traitement(predictions):
    """
    Applique les règles métier aux prédictions pour assurer leur cohérence
    """
    # Limites maximales par jour
    TAUX_MORTALITE_MAX = 0.05  # 5% maximum
    MAX_DECES_PAR_JOUR = 50    # Maximum 50 décès par jour
    MIN_CAS_POUR_DECES = 10    # Minimum 10 cas pour avoir des décès
    
    for pred in predictions:
        # Règle 1 : Valeurs toujours positives
        pred['new_cases_pred'] = max(0, pred['new_cases_pred'])
        pred['new_deaths_pred'] = max(0, pred['new_deaths_pred'])
        pred['countries_reporting_pred'] = max(0, pred['countries_reporting_pred'])
        
        # Règle 2 : Limitation du nombre de décès par jour
        pred['new_deaths_pred'] = min(pred['new_deaths_pred'], MAX_DECES_PAR_JOUR)
        
        # Règle 3 : Pas de décès si trop peu de cas
        if pred['new_cases_pred'] < MIN_CAS_POUR_DECES:
            pred['new_deaths_pred'] = 0
            
        # Règle 4 : Limitation du taux de mortalité
        if pred['new_cases_pred'] > 0:
            taux_mortalite = pred['new_deaths_pred'] / pred['new_cases_pred']
            if taux_mortalite > TAUX_MORTALITE_MAX:
                pred['new_deaths_pred'] = pred['new_cases_pred'] * TAUX_MORTALITE_MAX
    
    return predictions

def generate_predictions(year_to_predict: int = YEAR_TO_PREDICT):
    """
    Génère les prédictions pour une année donnée
    
    Args:
        year_to_predict (int): Année pour laquelle générer les prédictions
        
    Returns:
        list: Liste de dictionnaires contenant les prédictions
    """
    start_date = f"{year_to_predict}-01-01"
    end_date = f"{year_to_predict}-12-31"
    print(f"📅 Génération des prédictions pour l'année {year_to_predict}")

    date_range = pd.date_range(start=start_date, end=end_date)
    future_rows = []

    working_data = latest_data
    total_countries = len(working_data)
    processed_locations = set()  # Pour suivre les pays traités

    print(f"🌍 Début de la génération pour {total_countries} pays")

    # Features pour chaque modèle
    features_cases = [
        "total_cases", "location_encoded", "day", "month", "year",
        "total_deaths", "epidemic_phase", "days_since_start",
        "new_cases_rolling7", "trend_new_cases"
    ]

    features_deaths = [
        "total_cases", "location_encoded", "day", "month", "year",
        "total_deaths", "new_cases", "epidemic_phase", "days_since_start",
        "new_cases_rolling7", "trend_new_cases"
    ]

    features_geo = features_deaths.copy()

    try:
        for i, (_, row) in enumerate(working_data.iterrows(), 1):
            location = row["location"]
            print(f"🔄 Traitement pays {i}/{total_countries}: {location}")

            # Valeurs initiales
            total_cases = row["total_cases"]
            total_deaths = row["total_deaths"]
            new_cases_rolling7 = row["new_cases_rolling7"]
            trend_new_cases = row["trend_new_cases"]
            new_cases = row["new_cases"]

            country_predictions = []  # Prédictions pour le pays en cours

            for single_date in date_range:
                day = single_date.day
                month = single_date.month
                year = single_date.year
                days_since_start = (single_date - data["date"].min()).days

                # Features de base communes
                base_features = { 
                    "total_cases": total_cases,
                    "location_encoded": row["location_encoded"],
                    "day": day,
                    "month": month,
                    "year": year,
                    "total_deaths": total_deaths,
                    "epidemic_phase": 1,
                    "days_since_start": days_since_start,
                    "new_cases_rolling7": new_cases_rolling7,
                    "trend_new_cases": trend_new_cases,
                    "new_cases": new_cases
                }

                # Prédiction des cas
                features_for_cases = pd.DataFrame([base_features])[features_cases]
                new_cases_pred = model_cases.predict(features_for_cases)[0]

                # Prédiction des décès
                features_for_deaths = pd.DataFrame([base_features])[features_deaths]
                new_deaths_pred = model_deaths.predict(features_for_deaths)[0]

                # Prédiction de la propagation géographique
                features_for_geo = pd.DataFrame([base_features])[features_geo]
                countries_reporting_pred = model_geo.predict(features_for_geo)[0]

                country_predictions.append({
                    "date": single_date.date(),
                    "location": location,
                    "new_cases_pred": new_cases_pred,
                    "new_deaths_pred": new_deaths_pred,
                    "countries_reporting_pred": countries_reporting_pred
                })

            # Ajout des prédictions du pays au total
            future_rows.extend(country_predictions)
            processed_locations.add(location)
            print(f"✅ {location} terminé: {len(country_predictions)} prédictions générées")

            # Sauvegarde intermédiaire tous les 10 pays
            if i % 10 == 0:
                print(f"💾 Point de sauvegarde: {i}/{total_countries} pays traités")
                print(f"Pays traités: {sorted(processed_locations)}")

    except Exception as e:
        print(f"\n❌ ERREUR pendant le traitement: {str(e)}")
        print(f"Pays traités ({len(processed_locations)}/{total_countries}): {sorted(processed_locations)}")
        print(f"Dernier pays en cours: {location}")
        raise e

    # Application des règles métier
    future_rows = post_traitement(future_rows)
    
    print(f"\n✅ Prédictions générées avec succès")
    print(f"📊 {len(future_rows)} prédictions générées pour {len(processed_locations)} pays")
    print(f"Pays traités: {sorted(processed_locations)}")
    
    return future_rows

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Génère des prédictions COVID pour l'année 2025")
    parser.add_argument("--year", type=int, default=YEAR_TO_PREDICT, help="Année à prédire")
    args = parser.parse_args()

    # Génération des prédictions
    generate_predictions(args.year)


