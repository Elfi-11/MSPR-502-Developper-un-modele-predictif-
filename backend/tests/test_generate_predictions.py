import sys
import os
import pandas as pd
from datetime import datetime

# Ajouter le chemin du backend au PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from scripts.generate_predictions import generate_predictions

# Liste des pays à tester
PAYS_TEST = ["France", "Italy", "China", "United States"]
MOIS = {
    1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril",
    5: "Mai", 6: "Juin", 7: "Juillet", 8: "Août",
    9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre"
}

def test_predictions_simple():
    """
    Test simplifié pour vérifier les prédictions avec cumuls mensuels et annuels
    """
    print(f"\n🧪 Test des prédictions pour l'année 2025")
    
    # Charger les données historiques pour filtrer
    data_path = "data/covid_processed.csv"
    test_data_path = "data/covid_processed_test.csv"
    data = pd.read_csv(data_path, parse_dates=["date"])
    
    # Filtrer les données pour les pays de test
    data_filtered = data[data["location"].isin(PAYS_TEST)]
    
    try:
        # Créer un fichier de test séparé avec les données filtrées
        data_filtered.to_csv(test_data_path, index=False)
        
        # Générer les prédictions avec le fichier de test
        predictions = generate_predictions(2025, test_data_path)
        
        # Convertir en DataFrame
        df = pd.DataFrame(predictions)
        
        # Pour chaque pays
        for pays in df['location'].unique():
            pays_data = df[df['location'] == pays]
            
            print(f"\n{'=' * 50}")
            print(f"📊 {pays}")
            print(f"{'=' * 50}")
            
            # Cumuls mensuels
            print("\nCumuls mensuels :")
            print("-" * 30)
            for mois in range(1, 13):
                mois_data = pays_data[pays_data['month'] == mois]
                if not mois_data.empty:
                    dernier_jour = mois_data.iloc[-1]
                    print(f"\n{MOIS[mois]} 2025:")
                    print(f"  Cas total: {dernier_jour['monthly_cases']:,.0f}")
                    print(f"  Décès total: {dernier_jour['monthly_deaths']:,.0f}")
                    print(f"  Max pays touchés: {dernier_jour['monthly_reporting']:.0f}")
            
            # Totaux annuels
            print(f"\nTotaux annuels pour {pays}:")
            print("-" * 30)
            total_cases = pays_data.groupby('month')['monthly_cases'].last().sum()
            total_deaths = pays_data.groupby('month')['monthly_deaths'].last().sum()
            max_reporting = pays_data['monthly_reporting'].max()
            
            print(f"Cas total 2025: {total_cases:,.0f}")
            print(f"Décès total 2025: {total_deaths:,.0f}")
            print(f"Maximum pays touchés: {max_reporting:.0f}")
            
            # Moyennes mensuelles
            print(f"\nMoyennes mensuelles pour {pays}:")
            print("-" * 30)
            avg_cases = total_cases / 12
            avg_deaths = total_deaths / 12
            avg_reporting = pays_data['monthly_reporting'].mean()
            
            print(f"Moyenne cas par mois: {avg_cases:,.0f}")
            print(f"Moyenne décès par mois: {avg_deaths:,.0f}")
            print(f"Moyenne pays touchés: {avg_reporting:.0f}")
            
    finally:
        # Nettoyer le fichier de test
        if os.path.exists(test_data_path):
            os.remove(test_data_path)

if __name__ == "__main__":
    test_predictions_simple() 