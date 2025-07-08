# Frontend Prédictions IA - OMS

Interface utilisateur moderne pour afficher les prédictions de pandémies générées par l'IA.

## 🚀 Installation rapide

```bash
# Dans le dossier frontend/
npm install

# Lancer le serveur de développement
npm run dev
```

## 📱 Accès

- **Frontend** : http://localhost:3000
- **API Backend** : http://localhost:8000/api

## 🎯 Fonctionnalités

- ✅ **Charts.js** pour les visualisations (plus adapté que Plotly)
- ✅ **Interface accessible** (WCAG AA)
- ✅ **Design responsive** (mobile, tablette, desktop)
- ✅ **UX simplifiée** pour utilisateurs non-techniques
- ✅ **Navigation clavier** complète
- ✅ **Lecteurs d'écran** compatibles

## 📊 Graphiques disponibles

1. **😷 Taux de Transmission** - Nouveaux cas prédits
2. **💀 Mortalité** - Nouveaux décès prédits  
3. **🌍 Propagation Géographique** - Pays affectés prédits

## 🔧 Structure

```
src/
├── components/
│   └── PredictionChart.jsx    # Composant Chart.js
├── services/
│   └── api.js                 # Communication avec l'API
└── App.jsx                    # Application principale
```

## ⚠️ Données de démonstration

Si l'API backend n'est pas disponible, l'interface affiche automatiquement des données de démonstration pour permettre de tester l'interface.

## 🎨 Justification Chart.js vs Plotly

- **Meilleure UX** : Interface plus intuitive pour utilisateurs non-techniques
- **Accessibilité** : Support natif WCAG 
- **Performance** : Plus léger et rapide
- **Customisation** : Plus facile à adapter aux besoins OMS 