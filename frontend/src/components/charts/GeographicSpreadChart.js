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
    if (!predictionsData || !locations) {
      return [];
    }

    // Filtrer les données de propagation géographique
    const geoData = predictionsData.filter(item => item.indicateur === 'countries_reporting');
    
    if (geoData.length === 0) {
      return [];
    }

    // Regrouper par mois et par location
    const groupedData = {};
    geoData.forEach(item => {
      const date = new Date(item.date_predite);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = 0;
      }
      groupedData[monthKey] += item.valeur_predite || 0;
    });

    // Convertir en format pour le graphique
    const result = Object.entries(groupedData).map(([month, value]) => ({
      month,
      countries: Math.round(value)
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    return result;
  };

  const data = processData();

  if (data.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}>
        <h3>Propagation Géographique - Pays Rapportant des Cas</h3>
        <p>Aucune donnée de propagation géographique disponible.</p>
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