import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TransmissionChart = ({ predictionsData, locations, isLoading }) => {
  if (isLoading) {
    return <div>Chargement des données de transmission...</div>;
  }

  // Traitement simple des données
  const processData = () => {
    if (!predictionsData || !locations) return [];

    // Filtrer les données de transmission
    const transmissionData = predictionsData.filter(item => item.indicateur === 'new_cases');
    
    if (transmissionData.length === 0) return [];

    // Regrouper par mois
    const groupedData = {};
    transmissionData.forEach(item => {
      const date = new Date(item.date_predite);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = 0;
      }
      groupedData[monthKey] += item.valeur_predite || 0;
    });

    // Convertir en format pour le graphique
    return Object.entries(groupedData).map(([month, value]) => ({
      month,
      cases: Math.round(value * 100) / 100 // Arrondir à 2 décimales
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const data = processData();

  if (data.length === 0) {
    return <div>Aucune donnée de transmission disponible.</div>;
  }

  // Configuration des données pour Chart.js
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Nouveaux cas',
        data: data.map(item => item.cases),
        borderColor: 'rgba(37, 99, 235, 1)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: 'rgba(37, 99, 235, 1)',
        pointRadius: 4,
        pointBorderWidth: 2,
        tension: 0.1,
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
        text: 'Évolution de la Transmission - Nouveaux Cas',
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TransmissionChart; 