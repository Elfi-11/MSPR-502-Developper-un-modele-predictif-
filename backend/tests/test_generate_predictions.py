import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import shutil

# Ajouter le chemin du backend au PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from scripts.generate_predictions import generate_predictions, post_traitement

# Liste des pays à tester
PAYS_TEST = ["France", "Italy", "China", "United States"]

def test_predictions_stability():
    """
    Test pour vérifier que les prédictions restent stables et cohérentes
    """
    print("\n🧪 Test de stabilité des prédictions...")
    
    # Charger les données historiques pour filtrer
    data_path = "data/covid_processed.csv"
    data = pd.read_csv(data_path, parse_dates=["date"])
    
    # Filtrer les données pour les pays de test
    data_filtered = data[data["location"].isin(PAYS_TEST)]
    
    # Sauvegarder le fichier original
    original_file = "data/covid_processed.csv"
    backup_file = "data/covid_processed.csv.bak"
    
    try:
        # Faire une sauvegarde du fichier original
        shutil.copy2(original_file, backup_file)
        
        # Remplacer le fichier original par les données filtrées
        data_filtered.to_csv(original_file, index=False)
        
        # Générer les prédictions pour 2025
        predictions = generate_predictions(2025)
        
        # Convertir en DataFrame pour faciliter l'analyse
        df = pd.DataFrame(predictions)
        
        print(f"\nAnalyse des prédictions pour {', '.join(PAYS_TEST)}:")
        
        # Test 1: Vérifier que toutes les valeurs sont positives
        print("\n1️⃣ Test des valeurs négatives:")
        neg_cases = df[df["new_cases_pred"] < 0]
        neg_deaths = df[df["new_deaths_pred"] < 0]
        neg_reporting = df[df["countries_reporting_pred"] < 0]
        
        if len(neg_cases) == 0 and len(neg_deaths) == 0 and len(neg_reporting) == 0:
            print("✅ Toutes les valeurs sont positives")
        else:
            print("❌ Valeurs négatives trouvées:")
            if len(neg_cases) > 0:
                print(f"   - {len(neg_cases)} prédictions de cas négatifs")
            if len(neg_deaths) > 0:
                print(f"   - {len(neg_deaths)} prédictions de décès négatifs")
            if len(neg_reporting) > 0:
                print(f"   - {len(neg_reporting)} prédictions de propagation négatives")
        
        # Test 2: Vérifier les valeurs aberrantes
        print("\n2️⃣ Test des valeurs aberrantes:")
        MAX_CASES_PER_DAY = 1_000_000  # 1 million de cas par jour
        MAX_DEATHS_PER_DAY = 50        # 50 décès par jour (règle métier)
        MAX_COUNTRIES = 200            # Nombre max de pays raisonnable
        
        high_cases = df[df["new_cases_pred"] > MAX_CASES_PER_DAY]
        high_deaths = df[df["new_deaths_pred"] > MAX_DEATHS_PER_DAY]
        high_reporting = df[df["countries_reporting_pred"] > MAX_COUNTRIES]
        
        if len(high_cases) == 0 and len(high_deaths) == 0 and len(high_reporting) == 0:
            print("✅ Aucune valeur aberrante détectée")
        else:
            print("❌ Valeurs aberrantes trouvées:")
            if len(high_cases) > 0:
                print(f"   - {len(high_cases)} prédictions > {MAX_CASES_PER_DAY:,} cas/jour")
                print("   Détails des valeurs aberrantes (cas) :")
                for _, row in high_cases.iterrows():
                    print(f"     {row['location']}: {row['date']} - {row['new_cases_pred']:,.0f} cas")
            if len(high_deaths) > 0:
                print(f"   - {len(high_deaths)} prédictions > {MAX_DEATHS_PER_DAY} décès/jour")
                print("   Détails des valeurs aberrantes (décès) :")
                for _, row in high_deaths.iterrows():
                    print(f"     {row['location']}: {row['date']} - {row['new_deaths_pred']:,.0f} décès")
            if len(high_reporting) > 0:
                print(f"   - {len(high_reporting)} prédictions > {MAX_COUNTRIES} pays")
                print("   Détails des valeurs aberrantes (propagation) :")
                for _, row in high_reporting.iterrows():
                    print(f"     {row['location']}: {row['date']} - {row['countries_reporting_pred']:,.0f} pays")
        
        # Test 3: Vérifier la stabilité temporelle
        print("\n3️⃣ Test de la stabilité temporelle:")
        
        # Grouper par pays et calculer les statistiques
        country_stats = df.groupby("location").agg({
            "new_cases_pred": ["mean", "std", "max", "min"],
            "new_deaths_pred": ["mean", "std", "max", "min"]
        }).round(2)
        
        # Calculer le coefficient de variation (CV = écart-type / moyenne)
        country_stats["new_cases_pred", "cv"] = (
            country_stats["new_cases_pred", "std"] / 
            country_stats["new_cases_pred", "mean"]
        ).round(2)
        
        country_stats["new_deaths_pred", "cv"] = (
            country_stats["new_deaths_pred", "std"] / 
            country_stats["new_deaths_pred", "mean"]
        ).round(2)
        
        print("\nStatistiques par pays:")
        for country in PAYS_TEST:
            if country in country_stats.index:
                print(f"\n📊 {country}:")
                print(f"   Cas:")
                print(f"   - Moyenne: {country_stats.loc[country, ('new_cases_pred', 'mean')]:,.0f}")
                print(f"   - Min: {country_stats.loc[country, ('new_cases_pred', 'min')]:,.0f}")
                print(f"   - Max: {country_stats.loc[country, ('new_cases_pred', 'max')]:,.0f}")
                print(f"   - CV: {country_stats.loc[country, ('new_cases_pred', 'cv')]:.2f}")
                print(f"   Décès:")
                print(f"   - Moyenne: {country_stats.loc[country, ('new_deaths_pred', 'mean')]:,.0f}")
                print(f"   - Min: {country_stats.loc[country, ('new_deaths_pred', 'min')]:,.0f}")
                print(f"   - Max: {country_stats.loc[country, ('new_deaths_pred', 'max')]:,.0f}")
                print(f"   - CV: {country_stats.loc[country, ('new_deaths_pred', 'cv')]:.2f}")
        
        # Identifier les pays avec une forte variabilité
        HIGH_CV_THRESHOLD = 2.0  # Coefficient de variation > 200%
        unstable_countries = country_stats[
            (country_stats["new_cases_pred", "cv"] > HIGH_CV_THRESHOLD) |
            (country_stats["new_deaths_pred", "cv"] > HIGH_CV_THRESHOLD)
        ]
        
        if len(unstable_countries) == 0:
            print("\n✅ Les prédictions sont stables dans le temps")
        else:
            print("\n⚠️ Pays avec forte variabilité détectés:")
            for country in unstable_countries.index:
                print(f"\n   {country}:")
                print(f"   - Cas: moyenne={country_stats.loc[country, ('new_cases_pred', 'mean')]:,.0f}, "
                      f"CV={country_stats.loc[country, ('new_cases_pred', 'cv')]:.2f}")
                print(f"   - Décès: moyenne={country_stats.loc[country, ('new_deaths_pred', 'mean')]:,.0f}, "
                      f"CV={country_stats.loc[country, ('new_deaths_pred', 'cv')]:.2f}")
        
        # Test 4: Vérifier la cohérence des règles métier
        print("\n4️⃣ Test des règles métier:")
        
        # Règle: Pas de décès si moins de 10 cas
        invalid_deaths = df[
            (df["new_cases_pred"] < 10) & 
            (df["new_deaths_pred"] > 0)
        ]
        
        # Règle: Taux de mortalité maximum 5%
        mortality_rate = df["new_deaths_pred"] / df["new_cases_pred"].replace(0, float("inf"))
        high_mortality = df[mortality_rate > 0.05]
        
        if len(invalid_deaths) == 0 and len(high_mortality) == 0:
            print("✅ Toutes les règles métier sont respectées")
        else:
            print("❌ Violations des règles métier trouvées:")
            if len(invalid_deaths) > 0:
                print(f"   - {len(invalid_deaths)} cas de décès avec moins de 10 cas")
                print("   Détails:")
                for _, row in invalid_deaths.iterrows():
                    print(f"     {row['location']}: {row['date']} - {row['new_cases_pred']:.0f} cas, {row['new_deaths_pred']:.0f} décès")
            if len(high_mortality) > 0:
                print(f"   - {len(high_mortality)} cas de taux de mortalité > 5%")
                print("   Détails:")
                for _, row in high_mortality.iterrows():
                    mort_rate = row['new_deaths_pred'] / row['new_cases_pred'] * 100
                    print(f"     {row['location']}: {row['date']} - {mort_rate:.1f}% ({row['new_deaths_pred']:.0f}/{row['new_cases_pred']:.0f})")
        
        print("\n📊 Statistiques globales:")
        print(f"   Nombre total de prédictions: {len(df):,}")
        print(f"   Nombre de pays: {df['location'].nunique()}")
        print(f"   Période: du {df['date'].min()} au {df['date'].max()}")
        for country in PAYS_TEST:
            country_data = df[df["location"] == country]
            if not country_data.empty:
                print(f"\n   {country}:")
                print(f"   - Moyenne des cas/jour: {country_data['new_cases_pred'].mean():,.0f}")
                print(f"   - Moyenne des décès/jour: {country_data['new_deaths_pred'].mean():,.0f}")
                print(f"   - Moyenne des pays touchés: {country_data['countries_reporting_pred'].mean():,.0f}")
    
    finally:
        # Restaurer le fichier original
        if os.path.exists(backup_file):
            shutil.move(backup_file, original_file)

if __name__ == "__main__":
    test_predictions_stability() 