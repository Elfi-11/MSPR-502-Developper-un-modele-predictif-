import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.preprocessing import LabelEncoder

# === PARAMÈTRE DYNAMIQUE ===
YEAR_TO_PREDICT = 2025  # À modifier si besoin

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

print(data["year"].unique())
print(data[data["year"] == 2024].head())

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

# Remplacer les valeurs NaN par des valeurs par défaut
latest_data["new_cases"] = latest_data["new_cases"].fillna(0)
latest_data["new_deaths"] = latest_data["new_deaths"].fillna(0)
latest_data["new_cases_rolling7"] = latest_data["new_cases_rolling7"].fillna(0)
latest_data["trend_new_cases"] = latest_data["trend_new_cases"].fillna(0)

# Supprimer les lignes avec des valeurs critiques manquantes
latest_data = latest_data.dropna(subset=["total_cases", "total_deaths", "location_encoded"])

print(f"Après nettoyage: {len(latest_data)} pays")
print(f"Échantillon des données nettoyées:")
for i, (_, row) in enumerate(latest_data.head(3).iterrows()):
    print(f"  {row['location']}: total_cases={row['total_cases']:,}, new_cases={row['new_cases']:,}")

def generate_predictions(year_to_predict: int = YEAR_TO_PREDICT):
    """
    Génère les prédictions pour une année donnée
    
    Args:
        year_to_predict (int): Année pour laquelle générer les prédictions
        
    Returns:
        list: Liste de dictionnaires contenant les prédictions
    """
    # === GÉNÉRATION DES DONNÉES FUTURES AVEC MISE À JOUR DYNAMIQUE
    # Année complète 
    date_range = pd.date_range(start=f"{year_to_predict}-01-01", end=f"{year_to_predict}-12-31")
    future_rows = []

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

    for _, row in latest_data.iterrows():
        total_cases = row["total_cases"]
        total_deaths = row["total_deaths"]
        new_cases = row["new_cases"]
        new_cases_rolling7 = row["new_cases_rolling7"]
        trend_new_cases = row["trend_new_cases"]
        
        # Historique des 7 derniers jours pour calculer trend_new_cases correctement
        last_7_days_cases = [max(0, new_cases)] * 7  # Initialiser avec la dernière valeur connue (>=0)

        for single_date in date_range:
            day = single_date.day
            month = single_date.month
            year = single_date.year
            days_since_start = (single_date - data["date"].min()).days

            # === LIMITES STRICTES SUR LES FEATURES ===
            # Limiter trend_new_cases pour éviter les explosions
            trend_new_cases_limited = max(-100, min(100, trend_new_cases))
            
            # Limiter new_cases_rolling7 
            new_cases_rolling7_limited = max(0, min(1000, new_cases_rolling7))

            row_features_cases = pd.DataFrame([{ 
                "total_cases": total_cases,
                "location_encoded": row["location_encoded"],
                "day": day,
                "month": month,
                "year": year,
                "total_deaths": total_deaths,
                "epidemic_phase": 1,
                "days_since_start": days_since_start,
                "new_cases_rolling7": new_cases_rolling7_limited,
                "trend_new_cases": trend_new_cases_limited
            }])[features_cases]

            new_cases_pred = model_cases.predict(row_features_cases)[0]

            # === LIMITES STRICTES SUR LES PRÉDICTIONS ===
            # Limiter les prédictions à des valeurs réalistes
            new_cases_pred = max(0, min(5000, new_cases_pred))  # Max 5k cas/jour (réaliste pour 2025)

            row_features_deaths = row_features_cases.copy()
            row_features_deaths["new_cases"] = new_cases_pred
            row_features_deaths = row_features_deaths[features_deaths]
            new_deaths_pred = model_deaths.predict(row_features_deaths)[0]

            row_features_geo = row_features_deaths.copy()
            row_features_geo = row_features_geo[features_geo]
            countries_reporting_pred = model_geo.predict(row_features_geo)[0]

            # Sécurité finale
            new_cases_pred = max(0, new_cases_pred)
            new_deaths_pred = max(0, min(500, new_deaths_pred))  # Max 500 décès/jour
            countries_reporting_pred = max(0, min(255, countries_reporting_pred))  # Max 255 pays

            future_rows.append({
                "date": single_date.date(),  # Convertir en date pour la compatibilité avec la DB
                "location": row["location"],
                "new_cases_pred": new_cases_pred,
                "new_deaths_pred": new_deaths_pred,
                "countries_reporting_pred": countries_reporting_pred
            })

            # === MISE À JOUR DYNAMIQUE CONTRÔLÉE ===
            # BLOQUER l'accumulation pour éviter l'explosion
            # On garde les valeurs initiales fixes
            # total_cases += new_cases_pred  # DÉSACTIVÉ
            # total_deaths += new_deaths_pred  # DÉSACTIVÉ
            
            # Garder les valeurs initiales constantes
            total_cases = row["total_cases"]
            total_deaths = row["total_deaths"]
            
            # Calcul correct de trend_new_cases (différence sur 7 jours)
            trend_new_cases = new_cases_pred - last_7_days_cases[0]
            
            # Mise à jour de l'historique des 7 jours
            last_7_days_cases.pop(0)  # Supprimer le plus ancien
            last_7_days_cases.append(new_cases_pred)  # Ajouter le nouveau
            
            # Mise à jour des autres variables avec limites
            new_cases = new_cases_pred
            new_cases_rolling7 = (new_cases_rolling7 * 6 + new_cases_pred) / 7
            
            # Limiter new_cases_rolling7 pour éviter l'explosion
            new_cases_rolling7 = min(50000, new_cases_rolling7)

    return future_rows

# Si le script est exécuté directement (pas importé)
if __name__ == "__main__":
    predictions = generate_predictions(YEAR_TO_PREDICT)
    print(f"✅ Génération terminée pour {YEAR_TO_PREDICT}")
    print(f"📊 {len(predictions)} prédictions générées")
    
    # Afficher un échantillon
    if predictions:
        print("\n📋 Échantillon des prédictions:")
        for i, pred in enumerate(predictions[:5]):
            print(f"  {pred['date']} - {pred['location']}: "
                  f"Cas={pred['new_cases_pred']:.0f}, "
                  f"Décès={pred['new_deaths_pred']:.0f}, "
                  f"Pays={pred['countries_reporting_pred']:.0f}")
        
        # Statistiques des prédictions
        new_cases_values = [p['new_cases_pred'] for p in predictions]
        new_deaths_values = [p['new_deaths_pred'] for p in predictions]
        
        print(f"\n📈 Statistiques des prédictions:")
        print(f"   New cases - Moyenne: {np.mean(new_cases_values):.0f}, Max: {np.max(new_cases_values):.0f}")
        print(f"   New deaths - Moyenne: {np.mean(new_deaths_values):.0f}, Max: {np.max(new_deaths_values):.0f}")


