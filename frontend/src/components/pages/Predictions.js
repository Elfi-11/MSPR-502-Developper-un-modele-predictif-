import React, { useState, useEffect } from 'react';
import { GeographicSpreadChart, MortalityChart, TransmissionChart } from '../charts';

const Predictions = () => {
  const [predictionsData, setPredictionsData] = useState(null);
  const [locations, setLocations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [selectedCountry, setSelectedCountry] = useState('Afghanistan');
  const [availableCountries, setAvailableCountries] = useState([]);

  // Fonction pour récupérer les données de prédictions
  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Récupérer les prédictions
      const predictionsResponse = await fetch('http://localhost:8000/api/predictions/');
      if (!predictionsResponse.ok) {
        throw new Error('Erreur lors de la récupération des prédictions');
      }
      const predictionsData = await predictionsResponse.json();
      
      // Récupérer les locations
      const locationsResponse = await fetch('http://localhost:8000/api/pays/');
      if (!locationsResponse.ok) {
        throw new Error('Erreur lors de la récupération des locations');
      }
      const locationsData = await locationsResponse.json();
      
      setPredictionsData(predictionsData);
      setLocations(locationsData);
      
      // Créer la liste des pays disponibles
      if (locationsData && locationsData.length > 0) {
        const countries = locationsData.map(location => location.location_name || 'Inconnu');
        const uniqueCountries = [...new Set(countries)].sort();
        setAvailableCountries(uniqueCountries);
        
        // Définir Afghanistan par défaut car c'est le seul pays avec des données de prédiction
        setSelectedCountry('Afghanistan');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchPredictions();
  }, []);

  // Affichage en cas d'erreur
  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Prédictions</h1>
        <div style={{ color: 'red', padding: '1rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <p>Erreur : {error}</p>
          <button onClick={fetchPredictions} style={{ marginTop: '1rem' }}>
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Prédictions COVID-19</h1>
      <p>Visualisation des prédictions générées par le modèle de machine learning.</p>
      
      {/* Zone de filtres globale */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Filtres</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="country-select" style={{ fontWeight: '500', color: '#495057' }}>
              Pays :
            </label>
            <select
              id="country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            >
              <option value="">Tous les pays</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedCountry && (
          <p style={{ margin: '1rem 0 0 0', color: '#6c757d', fontStyle: 'italic' }}>
            Données filtrées pour : <strong>{selectedCountry}</strong>
          </p>
        )}
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <GeographicSpreadChart 
          predictionsData={predictionsData} 
          locations={locations} 
          isLoading={isLoading}
          selectedCountry={selectedCountry}
        />
        
        <MortalityChart 
          predictionsData={predictionsData} 
          locations={locations} 
          isLoading={isLoading}
          selectedCountry={selectedCountry}
        />
        
        <TransmissionChart 
          predictionsData={predictionsData} 
          locations={locations} 
          isLoading={isLoading}
          selectedCountry={selectedCountry}
        />
      </div>
    </main>
  );
};

export default Predictions; 