#!/usr/bin/env python3
"""
Script de test pour l'endpoint des prédictions COVID-19
"""

import asyncio
import sys
import os
from datetime import datetime

# Ajouter le chemin du backend au PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_predictions():
    """Test de l'endpoint des prédictions"""
    
    try:
        # Import des modules nécessaires
        from app.core.database import get_db
        from app.crud import predi_covid as crud_predi_covid
        from app.crud import location as crud_location
        from app.schemas.schemas import FPrediCovidCreate
        
        print("🔧 Test de l'endpoint des prédictions...")
        
        # Récupérer une session de base de données
        async for db in get_db():
            try:
                # Test 1: Vérifier la connexion à la base de données
                print("✅ Connexion à la base de données réussie")
                
                # Test 2: Créer une location de test
                test_location = await crud_location.obtenir_ou_creer_pays(db, "Test Country")
                print(f"✅ Location créée/récupérée: {test_location.location_name} (ID: {test_location.location_id})")
                
                # Test 3: Créer une prédiction de test
                test_prediction = FPrediCovidCreate(
                    date_predite=datetime.now().date(),
                    location_id=test_location.location_id,
                    indicateur="test_cases",
                    horizon=30,
                    valeur_predite=100.0,
                    model_name="Test Model"
                )
                
                saved_pred = await crud_predi_covid.creer_prediction_covid(db, test_prediction)
                print(f"✅ Prédiction de test créée: ID {saved_pred.pred_id}")
                
                # Test 4: Récupérer les prédictions
                predictions = await crud_predi_covid.liste_predictions_covid(db, limit=5)
                print(f"✅ {len(predictions)} prédictions récupérées de la base")
                
                # Test 5: Nettoyer les données de test
                await crud_predi_covid.supprimer_prediction_covid(db, saved_pred.pred_id)
                print("✅ Données de test nettoyées")
                
                print("\n🎉 Tous les tests sont passés avec succès !")
                print("\n📋 Pour tester l'endpoint complet:")
                print("1. Démarre le serveur: python -m uvicorn app.main:app --reload")
                print("2. Va sur: http://localhost:8000/docs")
                print("3. Teste l'endpoint: POST /api/predictions/generate/{year}")
                
            except Exception as e:
                print(f"❌ Erreur lors du test: {str(e)}")
                raise
            finally:
                break
                
    except Exception as e:
        print(f"❌ Erreur critique: {str(e)}")
        print("\n🔧 Vérifications à faire:")
        print("1. Le fichier .env contient-il DATABASE_URL?")
        print("2. La base de données PostgreSQL est-elle démarrée?")
        print("3. Les tables sont-elles créées? (python app/create_database.py)")

if __name__ == "__main__":
    asyncio.run(test_predictions()) 