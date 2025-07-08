import React, { useState, useEffect } from 'react';
import GeographicSpreadChart from './GeographicSpreadChart';
import MortalityChart from './MortalityChart';
import TransmissionChart from './TransmissionChart';

const Predictions = () => {
  const [predictionsData, setPredictionsData] = useState(null);
  const [locations, setLocations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les données de prédictions
  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Récupérer les prédictions
      const predictionsResponse = await fetch('/api/predictions/');
      if (!predictionsResponse.ok) {
        throw new Error('Erreur lors de la récupération des prédictions');
      }
      const predictionsData = await predictionsResponse.json();
      
      // Récupérer les locations
      const locationsResponse = await fetch('/api/pays/');
      if (!locationsResponse.ok) {
        throw new Error('Erreur lors de la récupération des locations');
      }
      const locationsData = await locationsResponse.json();
      
      setPredictionsData(predictionsData);
      setLocations(locationsData);
      
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
      
      {/* Debug: Afficher les données */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Debug Info:</h3>
        <p>Prédictions: {predictionsData ? predictionsData.length : 0} éléments</p>
        <p>Locations: {locations ? locations.length : 0} éléments</p>
        <p>Status: {isLoading ? 'Chargement...' : 'Chargé'}</p>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <GeographicSpreadChart 
          predictionsData={predictionsData} 
          locations={locations} 
          isLoading={isLoading} 
        />
        
        <MortalityChart 
          predictionsData={predictionsData} 
          locations={locations} 
          isLoading={isLoading} 
        />
        
        <TransmissionChart 
          predictionsData={predictionsData} 
          locations={locations} 
          isLoading={isLoading} 
        />
      </div>
    </main>
  );
};

export default Predictions;
