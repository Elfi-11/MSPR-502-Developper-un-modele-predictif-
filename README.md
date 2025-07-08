# Projet d'analyse COVID-19 et Mpox avec IA prédictive

Ce projet permet d'extraire, transformer, charger et visualiser les données mondiales sur le COVID-19 et le Mpox (connu sous le nom de monkeypox), ainsi que de **prédire les tendances futures** grâce à des modèles de machine learning.

## Fonctionnalités

### Analyse des données
- Téléchargement automatique des données depuis des sources fiables
- Nettoyage et transformation des données (ETL optimisé)
- Stockage des données dans une base PostgreSQL
- Génération de visualisations comparatives
- Dashboard interactif pour explorer les données
- API REST pour accéder aux données
- Comparaison des tendances entre COVID-19 et Mpox

### **🤖 Intelligence Artificielle et Prédictions**
- **Modèles de Machine Learning** entraînés pour prédire :
  - **Taux de transmission** (nouveaux cas quotidiens)
  - **Mortalité** (nouveaux décès quotidiens)
  - **Propagation géographique** (nombre de pays affectés)
- **Prédictions futures** de pandémies basées sur les tendances historiques
- **Modèles retenus** après tests comparatifs :
  - Random Forest pour les nouveaux cas
  - XGBoost pour la mortalité
  - Random Forest pour la propagation géographique
- **Génération automatique** de prédictions pour les années futures

## Structure du projet

```
MSPR-502-Developper-un-modele-predictif-/
│
├── backend/                          # API et gestion des données
│   ├── app/
│   │   ├── main.py                  # Point d'entrée FastAPI
│   │   ├── models/                  # Modèles SQLAlchemy
│   │   ├── schemas/                 # Schémas Pydantic
│   │   ├── crud/                    # Opérations CRUD
│   │   ├── api/                     # Routes API
│   │   ├── core/                    # Configuration
│   │   └── ml/                      # 🆕 Modèles Machine Learning
│   │       ├── death/               # Modèles de prédiction mortalité
│   │       ├── new_case/            # Modèles de prédiction nouveaux cas
│   │       ├── geographic_spread/   # Modèles propagation géographique
│   │       └── test_et_modele_non_retenu/  # Tests et modèles expérimentaux
│   │
│   ├── scripts/                     # Scripts utilitaires
│   │   ├── import_db.py            # Import des données
│   │   ├── etl_script.py           # Scripts ETL (sans fausses valeurs)
│   │   ├── dashboard.py            # Dashboard Plotly
│   │   └── generate_predictions.py # 🆕 Génération de prédictions IA
│   │
│   ├── tests/                       # 🆕 Tests unitaires et d'intégration
│   │   ├── test_predictions.py      # Tests des prédictions
│   │   ├── test_model_direct.py     # Tests des modèles ML
│   │   └── test_single_prediction.py # Tests unitaires
│   │
│   ├── data/                        # Données source et traitées
│   │   ├── covid_processed.csv      # Données COVID-19 nettoyées
│   │   └── mpox_processed.csv       # Données Mpox nettoyées
│   │
│   ├── ml_models/                   # 🆕 Modèles ML entraînés
│   │   ├── model_cases_rf.joblib    # Random Forest (nouveaux cas)
│   │   ├── model_deaths_xgb.joblib  # XGBoost (mortalité)
│   │   └── model_spread_rf.joblib   # Random Forest (propagation géo)
│   │
│   └── requirements.txt             # Dépendances Python (+ scikit-learn, joblib)
│
├── frontend/                        # Interface utilisateur (React)
└── README.md                        # Documentation
```

## Prérequis

- Python 3.8 ou supérieur
- PostgreSQL
- pip (gestionnaire de paquets Python)
- **Jupyter Notebook** (pour l'entraînement des modèles ML)
- **scikit-learn, XGBoost, joblib** (pour les modèles prédictifs)

## Installation

1. Cloner le projet
```bash
git clone https://github.com/Francoistlb/mspr_data_science.git
cd MSPR-502-Developper-un-modele-predictif-
```

2. Configuration de l'environnement backend
```bash
cd backend
python -m venv venv-ml
.\venv-ml\Scripts\activate  # Windows
source venv-ml/bin/activate # Linux/MacOS
pip install -r requirements.txt
```

3. Configuration de la base de données
- Créer un fichier `.env` dans le dossier backend :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mspr_db
```

## Utilisation

### Préparation des données (ETL)

1. Exécuter le processus ETL pour télécharger et transformer les données :
```bash
python run.py etl
python run.py analysis
```

**Amélioration ETL** : Les données ne remplacent plus automatiquement les valeurs manquantes (NaN) par 0, préservant la qualité des données pour l'entraînement ML.

### Mise en place de la base de données

1. Installer PostgreSQL et pgAdmin (sous Windows)

2. Créer et initialiser la base de données :
```bash
python -m backend.app.create_database
python -m backend.app.init_db
```

3. Importer les données préparées :
```bash
cd backend
python run.py importCovid
python run.py importMpox
python run.py importPrediCovid  # 🆕 Import des prédictions Covid
```

### **🤖 Entraînement des modèles IA**

Les modèles de machine learning sont entraînés via des notebooks Jupyter :

1. **Prédiction des nouveaux cas** :
   - `backend/app/ml/new_case/training_case_RF_covid19_final.ipynb`
   - `backend/app/ml/new_case/training_case_XGB_covid19_final.ipynb`

2. **Prédiction de la mortalité** :
   - `backend/app/ml/death/training_death_RF_covid19_final.ipynb`
   - `backend/app/ml/death/training_death_XGB_covid19_final.ipynb`

3. **Prédiction de la propagation géographique** :
   - `backend/app/ml/geographic_spread/training_geographic_spread_RF_covid19_final.ipynb`
   - `backend/app/ml/geographic_spread/training_geographic_spread_XGB_covid19_final.ipynb`

**Installation des dépendances ML** :
```bash
pip install ipykernel scikit-learn xgboost joblib
```

### **🔮 Génération de prédictions**

Générer des prédictions pour une année donnée :

```bash
# Prédictions pour 2025 (par défaut)
python run.py predictions

# Prédictions pour une année spécifique
python run.py predictions 2026
```

**Métriques de performance** :
- **Performance variable** selon le modèle, la période et le pays analysé
- **Coefficient de qualité (R²)** : Variable selon les conditions d'entraînement
- **Interprétation** : Les modèles sont évalués avec les métriques MAE, RMSE et R²

### API Backend

Pour lancer l'API :
```bash
python run_api.py
```

L'API sera accessible à :
- Interface : http://localhost:8000
- Documentation Swagger : http://localhost:8000/docs
- Endpoints : http://localhost:8000/api

### Dashboard

Le dashboard interactif comprend trois onglets :

1. **COVID-19**
   - Évolution temporelle des cas
   - Distribution mondiale des cas (carte)
   - Comparaison entre pays
   - Filtres par pays, métrique et plage de dates

2. **Mpox**
   - Évolution temporelle des cas
   - Distribution mondiale des cas (carte)
   - Comparaison entre pays
   - Filtres par pays métrique et plage de dates

3. **Comparaison**
   - Tendances temporelles
   - Distribution mondiale des cas (carte)
   - Échelle logarithmique pour comparer les deux maladies
   - Filtres par pays

```bash
python run.py dashboard
```

Accessible à : http://127.0.0.1:8050

## **🧠 Modèles de Machine Learning**

### Modèles retenus après tests comparatifs

1. **Prédiction des nouveaux cas** : Random Forest
   - Variables : `total_cases`, `location_encoded`, `day`, `month`, `year`, `total_deaths`, `epidemic_phase`
   - Performance : R² jusqu'à 0.98 sur périodes courtes

2. **Prédiction de la mortalité** : XGBoost
   - Variables : `total_cases`, `new_cases`, `location_encoded`, `day`, `month`, `year`, `total_deaths`
   - Performance : Erreur moyenne de 79 décès (23% d'erreur relative)

3. **Prédiction de la propagation géographique** : Random Forest
   - Variables : Similaires à la mortalité
   - Performance : Capacité à prédire le nombre de pays affectés

### Stratégie d'entraînement

- **Données ciblées** : Focus sur les pays avec des données complètes (ex: Union Européenne)
- **Périodes d'entraînement** : Tests sur 7, 15, 30 jours pour optimiser la précision
- **Validation croisée** : Split train/test pour évaluer la généralisation
- **Métriques** : MAE, RMSE, R² pour évaluer la performance

## Structure des données

### COVID-19
Les données proviennent de "Our World in Data" et contiennent :
- Nombre total de cas par pays
- Nouveaux cas quotidiens
- Décès totaux et nouveaux
- Données sur les hospitalisations (avec valeurs manquantes préservées)
- Données sur la vaccination (avec valeurs manquantes préservées)

### Mpox
Les données proviennent de Kaggle et contiennent :
- Cas confirmés par pays
- Dates de confirmation
- Distribution géographique
- Métriques par million d'habitants

### **🔮 Prédictions**
Les prédictions générées comprennent :
- Nouveaux cas quotidiens prédits par pays
- Nouveaux décès quotidiens prédits par pays
- Nombre de pays affectés prédits
- Projections sur 12 mois (configurable)

## Tests et qualité

### Tests disponibles
```bash
# Tests des prédictions
python -m pytest backend/tests/test_predictions.py

# Tests des modèles ML
python -m pytest backend/tests/test_model_direct.py

# Tests unitaires
python -m pytest backend/tests/test_single_prediction.py
```

### Métriques de qualité ML

| Pourcentage d'erreur (MAE/Moyenne) | Interprétation |
|-------------------------------------|----------------|
| < 10%                               | Excellent      |
| 10% - 20%                           | Très bon       |
| 20% - 30%                           | Bon/Acceptable |
| 30% - 50%                           | Moyen          |
| > 50%                               | À améliorer    |

## Développement

### Structure du code
- **Modèles de données** : `backend/app/models/`
- **Schémas Pydantic** : `backend/app/schemas/`
- **Opérations CRUD** : `backend/app/crud/`
- **Routes API** : `backend/app/api/endpoints/`
- **Configuration** : `backend/app/core/`
- **🆕 Modèles ML** : `backend/app/ml/`
- **🆕 Tests** : `backend/tests/`

### Commandes disponibles

```bash
# Données
python run.py etl              # Extraction, transformation, chargement
python run.py importCovid      # Import données COVID-19
python run.py importMpox       # Import données Mpox
python run.py importPrediCovid # Import prédictions COVID-19

# Visualisation
python run.py dashboard        # Dashboard interactif
python run.py analysis         # Analyse des données

# 🆕 Intelligence Artificielle
python run.py predictions      # Génération de prédictions (2025)
python run.py predictions 2026 # Prédictions pour une année spécifique
```

## Remarques

Ce projet est développé à des fins éducatives et de recherche dans le cadre du MSPR Data Science. Les modèles de machine learning sont entraînés sur des données historiques et permettent de faire des prédictions sur les tendances futures des pandémies.

**⚠️ Important** : Les prédictions sont basées sur des modèles statistiques et ne doivent pas être utilisées comme seule source pour des décisions de santé publique. Les données sont régulièrement mises à jour par leurs sources respectives.

### Améliorations futures
- Intégration de plus de variables explicatives
- Modèles plus sophistiqués (LSTM, réseaux de neurones)
- Prédictions en temps réel
- Interface web pour visualiser les prédictions
- Modèles spécifiques par région/pays 