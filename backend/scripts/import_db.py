import os
import sys
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

def get_sync_db():
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL n'est pas défini dans le fichier .env")
    
    SYNC_DATABASE_URL = DATABASE_URL.replace('postgresql+asyncpg', 'postgresql+psycopg2')
    engine = create_engine(SYNC_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def insert_f_covid():
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'covid_processed.csv')
    df = pd.read_csv(data_path)

    df['date'] = pd.to_datetime(df['date'])

    db: Session = get_sync_db()
    try:
        # Vérifier si la table d_location existe et a des données
        location_count = db.execute(text("SELECT COUNT(*) FROM d_location")).scalar()
        
        if location_count == 0:
            print("Import des locations dans d_location...")
            locations_df = pd.DataFrame({'location_name': df['location'].unique()})
            locations_df.to_sql('d_location', db.bind, if_exists='append', index=False)
            db.commit()
        else:
            print(f"Table d_location existe déjà avec {location_count} locations.")

        # Vider uniquement les données COVID (pas la structure)
        print("Suppression des anciennes données COVID...")
        db.execute(text("DELETE FROM f_covid"))
        db.commit()

        location_mapping = pd.read_sql('SELECT location_id, location_name FROM d_location', db.bind)

        covid_facts = df.merge(location_mapping, left_on='location', right_on='location_name')

        f_covid = covid_facts[[
            'date',
            'location_id',
            'total_cases',
            'new_cases',
            'total_deaths',
            'new_deaths',
            'icu_patients',
            'hosp_patients',
            'total_vaccinations',
            'people_vaccinated'
        ]]

        print("Import des données f_covid...")
        f_covid.to_sql('f_covid', db.bind, if_exists='append', index=False)
        db.commit()
        print("✅ Import COVID terminé.")
    except Exception as e:
        print(f"❌ Erreur lors de l'import COVID : {e}")
        db.rollback()
    finally:
        db.close()

def insert_f_mpox():
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'mpox_processed.csv')
    df = pd.read_csv(data_path)

    df['date'] = pd.to_datetime(df['date'])

    db: Session = get_sync_db()
    try:
        # Vérifier si la table d_location existe
        location_count = db.execute(text("SELECT COUNT(*) FROM d_location")).scalar()
        
        if location_count == 0:
            print("⚠️  Attention: Table d_location vide. Importez d'abord les données COVID.")
            return

        # Vider uniquement les données Mpox (pas la structure)
        print("Suppression des anciennes données Mpox...")
        db.execute(text("DELETE FROM f_mpox"))
        db.commit()

        location_mapping = pd.read_sql('SELECT location_id, location_name FROM d_location', db.bind)

        mpox_facts = df.merge(location_mapping, left_on='location', right_on='location_name')

        f_mpox = mpox_facts[[
            'date',
            'location_id',
            'total_cases',
            'total_deaths',
            'new_cases',
            'new_deaths',
            'new_cases_smoothed',
            'new_deaths_smoothed',
            'new_cases_per_million',
            'total_cases_per_million',
            'new_cases_smoothed_per_million',
            'new_deaths_per_million',
            'total_deaths_per_million',
            'new_deaths_smoothed_per_million'
        ]]

        print("Import des données f_mpox...")
        f_mpox.to_sql('f_mpox', db.bind, if_exists='append', index=False)
        db.commit()
        print("✅ Import Mpox terminé.")
    except Exception as e:
        print(f"❌ Erreur lors de l'import Mpox : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "importCovid":
            insert_f_covid()
        elif cmd == "importMpox":
            insert_f_mpox()
        else:
            print("Commande inconnue. Utilisez : importCovid ou importMpox")
    else:
        print("Veuillez fournir une commande.")
