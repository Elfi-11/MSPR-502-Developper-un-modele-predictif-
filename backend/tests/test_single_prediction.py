import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder
from datetime import datetime, date

print("🧪 Test d'une prédiction simple...")

# Charger les données
data = pd.read_csv('data/covid_processed.csv', parse_dates=["date"])

# Préparation des données
data["location_encoded"] = LabelEncoder().fit_transform(data["location"])
data["day"] = data["date"].dt.day
data["month"] = data["date"].dt.month
data["year"] = data["date"].dt.year
data["epidemic_phase"] = data["year"].apply(lambda y: 0 if y <= 2022 else 1)
data["days_since_start"] = (data["date"] - data["date"].min()).dt.days

data.sort_values(["location", "date"], inplace=True)
data["new_cases_rolling7"] = data.groupby("location")["new_cases"].transform(lambda x: x.rolling(7, min_periods=1).mean())
data["trend_new_cases"] = data.groupby("location")["new_cases"].transform(lambda x: x.diff(7))

# Charger le modèle
model_cases = joblib.load("ml_models/model_cases_rf.joblib")

# Prendre la France comme exemple
france_data = data[data["location"] == "France"].copy()
latest_france = france_data.sort_values("date").iloc[-1]

print(f"📍 Dernière donnée France: {latest_france['date'].date()}")
print(f"   Total cases: {latest_france['total_cases']:,}")
print(f"   New cases: {latest_france['new_cases']:,}")
print(f"   Total deaths: {latest_france['total_deaths']:,}")
print(f"   New deaths: {latest_france['new_deaths']:,}")

# Prédiction pour le 1er janvier 2025
features_cases = [
    "total_cases", "location_encoded", "day", "month", "year",
    "total_deaths", "epidemic_phase", "days_since_start",
    "new_cases_rolling7", "trend_new_cases"
]

# Créer les données pour la prédiction
prediction_date = datetime(2025, 1, 1)
days_since_start = (prediction_date - data["date"].min()).days

test_features = pd.DataFrame([{
    "total_cases": latest_france["total_cases"],
    "location_encoded": latest_france["location_encoded"],
    "day": prediction_date.day,
    "month": prediction_date.month,
    "year": prediction_date.year,
    "total_deaths": latest_france["total_deaths"],
    "epidemic_phase": 1,  # Post-2022
    "days_since_start": days_since_start,
    "new_cases_rolling7": latest_france["new_cases_rolling7"],
    "trend_new_cases": latest_france["trend_new_cases"]
}])[features_cases]

print(f"\n🔮 Prédiction pour la France le {prediction_date.date()}:")
print("Features utilisées:")
for col in features_cases:
    print(f"  {col}: {test_features[col].iloc[0]}")

prediction = model_cases.predict(test_features)[0]
print(f"\n📊 Résultat: {prediction:,.0f} nouveaux cas prédits")

# Test avec différentes valeurs de total_cases
print("\n🔬 Test avec différentes valeurs de total_cases:")
for multiplier in [0.5, 1.0, 2.0, 5.0, 10.0]:
    test_features_mod = test_features.copy()
    test_features_mod["total_cases"] = latest_france["total_cases"] * multiplier
    pred_mod = model_cases.predict(test_features_mod)[0]
    print(f"  Total cases x{multiplier}: {pred_mod:,.0f} nouveaux cas")

# Test avec différentes valeurs de trend_new_cases
print("\n🔬 Test avec différentes valeurs de trend_new_cases:")
for trend_val in [-10000, -1000, 0, 1000, 10000, 100000]:
    test_features_mod = test_features.copy()
    test_features_mod["trend_new_cases"] = trend_val
    pred_mod = model_cases.predict(test_features_mod)[0]
    print(f"  Trend = {trend_val}: {pred_mod:,.0f} nouveaux cas")

# Test avec différentes valeurs de new_cases_rolling7
print("\n🔬 Test avec différentes valeurs de new_cases_rolling7:")
for rolling_val in [0, 100, 1000, 10000, 100000]:
    test_features_mod = test_features.copy()
    test_features_mod["new_cases_rolling7"] = rolling_val
    pred_mod = model_cases.predict(test_features_mod)[0]
    print(f"  Rolling7 = {rolling_val}: {pred_mod:,.0f} nouveaux cas") 