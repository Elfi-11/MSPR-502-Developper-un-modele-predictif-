import pandas as pd
import numpy as np
import joblib

# Charger le modèle
model_cases = joblib.load("ml_models/model_cases_rf.joblib")

# Créer des données de test RÉALISTES (basées sur les vraies données 2024)
test_data = pd.DataFrame([{
    "total_cases": 235214,  # Afghanistan
    "location_encoded": 1,
    "day": 15,
    "month": 1,
    "year": 2025,
    "total_deaths": 7896,
    "epidemic_phase": 1,
    "days_since_start": 1800,
    "new_cases_rolling7": 0,  # Très faible comme en 2024
    "trend_new_cases": 0     # Pas de tendance
}])

print("🧪 Test du modèle avec des données réalistes:")
print("Données d'entrée:")
print(test_data)

# Prédiction
prediction = model_cases.predict(test_data)[0]
print(f"\n📊 Prédiction brute du modèle: {prediction:,.0f}")

# Test avec des valeurs légèrement différentes
test_data2 = test_data.copy()
test_data2["new_cases_rolling7"] = 10  # 10 cas en moyenne
test_data2["trend_new_cases"] = 5      # Légère hausse

prediction2 = model_cases.predict(test_data2)[0]
print(f"📊 Prédiction avec new_cases_rolling7=10: {prediction2:,.0f}")

# Test avec des valeurs plus élevées
test_data3 = test_data.copy()
test_data3["new_cases_rolling7"] = 100  # 100 cas en moyenne
test_data3["trend_new_cases"] = 50      # Hausse modérée

prediction3 = model_cases.predict(test_data3)[0]
print(f"📊 Prédiction avec new_cases_rolling7=100: {prediction3:,.0f}")

print(f"\n🎯 Conclusion:")
print(f"   - Données quasi-nulles: {prediction:,.0f}")
print(f"   - Données faibles: {prediction2:,.0f}")
print(f"   - Données modérées: {prediction3:,.0f}")

if prediction > 10000:
    print("❌ PROBLÈME: Le modèle génère des valeurs énormes même avec des données réalistes")
else:
    print("✅ MODÈLE OK: Le problème vient du script de génération") 