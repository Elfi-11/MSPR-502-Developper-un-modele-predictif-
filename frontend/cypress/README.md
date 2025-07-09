# Test Scripts pour Cypress

## Prérequis
- Backend doit être démarré sur http://localhost:8000
- Frontend doit être démarré sur http://localhost:5173

## Instructions de test

### 1. Démarrer le backend
```bash
cd backend
# Activer l'environnement virtuel
venpred\Scripts\activate
# Démarrer l'API
python run_api.py
```

### 2. Démarrer le frontend
```bash
cd frontend
npm run dev
```

### 3. Lancer les tests Cypress

#### Mode interactif (recommandé pour le développement)
```bash
cd frontend
npx cypress open
```

#### Mode headless (pour CI/CD)
```bash
cd frontend
npx cypress run
```

#### Lancer uniquement les tests COVID Archives
```bash
cd frontend
npx cypress run --spec "cypress/e2e/covid-archives.cy.js"
```

## Structure des tests

### covid-archives.cy.js
- **Page Loading and Navigation** : Test du chargement et de la navigation
- **Country Selection and Pre-selection** : Test de la sélection de pays et pré-sélection
- **Charts Display and Functionality** : Test de l'affichage et fonctionnalité des graphiques
- **Responsive Design** : Test du design responsive
- **Error Handling** : Test de la gestion d'erreurs

## Sélecteurs de test utilisés

- `[data-testid="loading-spinner"]` : Indicateur de chargement
- `[data-testid="error-message"]` : Messages d'erreur
- `[data-testid="country-filter"]` : Sélecteur de pays
- `[data-testid="country-option-{countryName}"]` : Options de pays
- `[data-testid="selected-country-{countryName}"]` : Pays sélectionnés (chips)
- `[data-testid="chart-{metric}"]` : Graphiques par métrique
- `[data-testid="no-data-message"]` : Message aucune donnée
- `[data-testid="no-countries-message"]` : Message aucun pays sélectionné

## Commandes personnalisées Cypress

- `cy.waitForCovidData()` : Attendre le chargement des données COVID
- `cy.selectCountry(countryName)` : Sélectionner un pays
- `cy.verifyChartExists(metric)` : Vérifier l'existence d'un graphique
