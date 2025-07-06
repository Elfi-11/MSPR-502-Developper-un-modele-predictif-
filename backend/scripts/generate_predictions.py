import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.preprocessing import LabelEncoder

# === PARAMÈTRE DYNAMIQUE ===
YEAR_TO_PREDICT = 2025  # À modifier si besoin

# === CHARGEMENT DES MODÈLES ===
model_cases = joblib.load("../ml_models/model_cases_rf.joblib")
model_deaths = joblib.load("../ml_models/model_deaths_xgb.joblib")
model_geo = joblib.load("../ml_models/model_spread_rf.joblib")

# === CHARGEMENT DES DONNÉES HISTORIQUES ===
data_path = "../data/covid_processed.csv"
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

# === Vérifier les donées ===
print(data["year"].unique())
print(data[data["year"] == 2024].head())

# Récupérer la dernière ligne connue pour chaque pays (pour l'année max)
max_year = data["year"].max()

def get_last_valid_row(df, year):
    subset = df[df["year"] == year]
    if not subset.empty:
        return subset.sort_values("date").iloc[[-1]] 
    else:
        return pd.DataFrame()  # renvoie un DataFrame vide

latest_data = (
    data.groupby("location", group_keys=False)
    .apply(lambda df: get_last_valid_row(df, max_year))
    .dropna(how="all")  # supprime les lignes complètement vides
    .reset_index(drop=True)
)

if latest_data.empty:
    print(f"❌ Aucun pays n'a de données pour l'année {max_year}")
    exit()

# Génération des données futures
date_range = pd.date_range(start=f"{YEAR_TO_PREDICT}-01-01", end=f"{YEAR_TO_PREDICT}-12-31")
future_rows = []
for _, row in latest_data.iterrows():
    for single_date in date_range:
        future_rows.append({
            "date": single_date,
            "location": row["location"],
            "location_encoded": row["location_encoded"],
            "day": single_date.day,
            "month": single_date.month,
            "year": single_date.year,
            "total_cases": row["total_cases"],
            "total_deaths": row["total_deaths"],
            "new_cases": row["new_cases"],
            "epidemic_phase": 1,
            "days_since_start": (single_date - data["date"].min()).days,
            "new_cases_rolling7": row["new_cases_rolling7"],
            "trend_new_cases": row["trend_new_cases"]
        })

future_df = pd.DataFrame(future_rows)

# Vérification
if future_df.empty:
    print("❌ Aucune donnée future générée.")
    exit()

# === PRÉDICTIONS ===
features_cases = [
    "total_cases", "location_encoded", "day", "month", "year",
    "total_deaths", "epidemic_phase", "days_since_start",
    "new_cases_rolling7", "trend_new_cases"
]

future_df["new_cases_pred"] = model_cases.predict(future_df[features_cases])


features_deaths = [
    "total_cases", "location_encoded", "day", "month", "year",
    "total_deaths", "new_cases", "epidemic_phase", "days_since_start",
    "new_cases_rolling7", "trend_new_cases"
]

future_df["new_deaths_pred"] = model_deaths.predict(future_df[features_deaths])


features_geo = [
    "total_cases", "location_encoded", "day", "month", "year",
    "total_deaths", "new_cases", "epidemic_phase", "days_since_start",
    "new_cases_rolling7", "trend_new_cases"
]

future_df["countries_reporting_pred"] = model_geo.predict(future_df[features_geo])

# Post-traitement
future_df["new_cases_pred"] = np.maximum(future_df["new_cases_pred"], 0)
future_df["new_deaths_pred"] = np.maximum(future_df["new_deaths_pred"], 0)
future_df["countries_reporting_pred"] = np.maximum(future_df["countries_reporting_pred"], 0)

# === EXPORT CSV ===
output_dir = "../data/predictions"
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(output_dir, f"prediction_{YEAR_TO_PREDICT}.csv")
future_df[["date", "location", "new_cases_pred", "new_deaths_pred", "countries_reporting_pred"]].to_csv(output_path, index=False)

print(f"✅ Prédictions sauvegardées dans : {output_path}")
