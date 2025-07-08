import React, { useState, useEffect } from 'react';
import GeographicSpreadChart from './components/GeographicSpreadChart';
import MortalityChart from './components/MortalityChart';
import TransmissionChart from './components/TransmissionChart';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [predictionsData, setPredictionsData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer toutes les prédictions et locations
        const [predictions, locationsList] = await Promise.all([
          apiService.getAllPredictionsFromDB(),
          apiService.getLocations()
        ]);
        
        setPredictionsData(predictions);
        setLocations(locationsList);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="loading">Chargement des données...</div>;
  }

  return (
    <div className="App">
      <h1>Prédictions COVID-19</h1>
      
      <div className="charts-container">
        <GeographicSpreadChart 
          predictionsData={predictionsData}
          locations={locations}
          useMonthlyAggregation={true}
          isLoading={isLoading}
          showTitle={true}
        />
        
        <MortalityChart 
          predictionsData={predictionsData}
          locations={locations}
          useMonthlyAggregation={true}
          isLoading={isLoading}
          showTitle={true}
        />
        
        <TransmissionChart 
          predictionsData={predictionsData}
          locations={locations}
          useMonthlyAggregation={true}
          isLoading={isLoading}
          showTitle={true}
        />
      </div>
    </div>
  );
}

export default App;