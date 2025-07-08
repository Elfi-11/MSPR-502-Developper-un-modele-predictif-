import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GeographicSpreadChart = ({ predictionsData, locations, isLoading }) => {
  if (isLoading) {
    return <div>Chargement des données géographiques...</div>;
  }

  // Traitement simple des données
  const processData = () => {
    console.log('🔍 GeographicSpreadChart - processData called');
    console.log('📊 predictionsData:', predictionsData);
    console.log('📍 locations:', locations);
    
    if (!predictionsData || !locations) {
      console.log('❌ Pas de données disponibles');
      return [];
    }

    // Filtrer les données de propagation géographique
    const geoData = predictionsData.filter(item => item.indicateur === 'countries_reporting');
    console.log('🌍 geoData filtered:', geoData);
    
    if (geoData.length === 0) {
      console.log('❌ Aucune donnée countries_reporting');
      return [];
    }

    // Regrouper par mois et par location
    const groupedData = {};
    geoData.forEach(item => {
      const date = new Date(item.date_predite);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      console.log(`📅 Processing: ${item.date_predite} -> ${monthKey}, value: ${item.valeur_predite}`);
      
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = 0;
      }
      groupedData[monthKey] += item.valeur_predite || 0;
    });

    console.log('📈 groupedData:', groupedData);

    // Convertir en format pour le graphique
    const result = Object.entries(groupedData).map(([month, value]) => ({
      month,
      countries: Math.round(value)
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    console.log('🎯 Final result:', result);
    return result;
  };

  const data = processData();
  console.log('📊 Processed data for chart:', data);

  if (data.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}>
        <h3>Propagation Géographique - Pays Rapportant des Cas</h3>
        <p>Aucune donnée de propagation géographique disponible.</p>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Debug: predictionsData={predictionsData ? predictionsData.length : 'null'} éléments
        </p>
      </div>
    );
  }

  // Configuration des données pour Chart.js
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Pays rapportant',
        data: data.map(item => item.countries),
        backgroundColor: 'rgba(136, 132, 216, 0.6)',
        borderColor: 'rgba(136, 132, 216, 1)',
        borderWidth: 1,
      },
    ],
  };

  console.log('📊 Chart.js data:', chartData);

  // Options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Propagation Géographique - Pays Rapportant des Cas',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GeographicSpreadChart; 