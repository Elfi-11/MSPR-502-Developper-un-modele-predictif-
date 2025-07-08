from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime, date

from backend.app.core.database import get_db, engine
from backend.app.crud import predi_covid as crud_predi_covid
from backend.app.crud import location as crud_location
from backend.app.schemas.schemas import FPrediCovidCreate, FPrediCovidRead
from backend.app.models.models import FPrediCovid, Base

router = APIRouter()

async def check_and_create_tables():
    """
    Vérifie si les tables existent et les crée si nécessaire
    """
    try:
        async with engine.begin() as conn:
            # Vérifier si la table f_predi_covid existe
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'f_predi_covid'
                );
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("🔧 Table f_predi_covid n'existe pas, création en cours...")
                # Créer toutes les tables
                await conn.run_sync(Base.metadata.create_all)
                print("✅ Tables créées avec succès")
            else:
                print("✅ Table f_predi_covid existe déjà")
                
    except Exception as e:
        print(f"❌ Erreur lors de la vérification/création des tables: {str(e)}")
        raise

@router.post("/generate/{year}", response_model=List[FPrediCovidRead])
async def generate_predictions_for_year(
    year: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Génère des prédictions pour une année donnée et les sauvegarde en base de données
    """
    try:
        # 1. Vérifier et créer les tables si nécessaire
        print("🔍 Vérification des tables...")
        await check_and_create_tables()
        
        # 2. Import dynamique du script de génération
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../../scripts'))
        from generate_predictions import generate_predictions
        
        print(f"🎯 Génération des prédictions pour {year}...")
        
        # 3. Générer les prédictions
        predictions_data = generate_predictions(year)
        print(f"📊 {len(predictions_data)} prédictions générées par le script")
        
        # 4. Sauvegarder en base de données
        saved_predictions = []
        print("💾 Sauvegarde en base de données...")
        
        for i, pred_data in enumerate(predictions_data):
            if i % 1000 == 0:  # Afficher le progrès tous les 1000 enregistrements
                print(f"   Traitement: {i}/{len(predictions_data)} ({i/len(predictions_data)*100:.1f}%)")
            
            # Récupérer ou créer la location
            location = await crud_location.obtenir_ou_creer_pays(db, pred_data["location"])
            
            # Créer les prédictions pour chaque indicateur
            for indicateur, valeur in [
                ("new_cases", pred_data["new_cases_pred"]),
                ("new_deaths", pred_data["new_deaths_pred"]),
                ("countries_reporting", pred_data["countries_reporting_pred"])
            ]:
                pred_create = FPrediCovidCreate(
                    date_predite=pred_data["date"],
                    location_id=location.location_id,
                    indicateur=indicateur,
                    horizon=365,  # Prédiction sur 1 an
                    valeur_predite=float(valeur),
                    model_name="RF_XGB_Ensemble"  # Nom du modèle utilisé
                )
                
                saved_pred = await crud_predi_covid.creer_prediction_covid(db, pred_create)
                saved_predictions.append(saved_pred)
        
        print(f"✅ {len(saved_predictions)} enregistrements sauvegardés en base")
        return saved_predictions
        
    except ImportError as e:
        print(f"❌ Erreur d'import du script: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur d'import du script de génération: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Erreur lors de la génération des prédictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération des prédictions: {str(e)}"
        )

@router.get("/", response_model=List[FPrediCovidRead])
async def get_predictions(
    skip: int = 0,
    limit: int = 100,
    location_id: Optional[int] = None,
    indicateur: Optional[str] = None,
    horizon: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère les prédictions avec filtres optionnels
    """
    predictions = await crud_predi_covid.liste_predictions_covid(
        db, skip=skip, limit=limit, 
        location_id=location_id, 
        indicateur=indicateur, 
        horizon=horizon
    )
    return predictions

@router.get("/{pred_id}", response_model=FPrediCovidRead)
async def get_prediction_by_id(
    pred_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Récupère une prédiction par son ID
    """
    prediction = await crud_predi_covid.obtenir_prediction_covid_par_id(db, pred_id)
    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prédiction non trouvée"
        )
    return prediction

@router.delete("/{pred_id}")
async def delete_prediction(
    pred_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Supprime une prédiction par son ID
    """
    success = await crud_predi_covid.supprimer_prediction_covid(db, pred_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prédiction non trouvée"
        )
    return {"message": "Prédiction supprimée avec succès"} 