import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  datasets: [
    {
      label: 'Taux de transmission prédite',
      data: [1.2, 1.3, 1.1, 1.4, 1.5, 1.3, 1.2, 1.1, 1.0, 1.2, 1.3, 1.4],
      fill: false,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#222',
        font: { size: 16 },
      },
    },
    title: {
      display: true,
      text: 'Évolution du taux de transmission prédite',
      color: '#222',
      font: { size: 20 },
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Mois',
        color: '#222',
        font: { size: 16 },
      },
      ticks: { color: '#222' },
    },
    y: {
      title: {
        display: true,
        text: 'Taux de transmission',
        color: '#222',
        font: { size: 16 },
      },
      ticks: { color: '#222' },
    },
  }
};

const LineChart = () => (
  <section aria-label="Courbe d'évolution du taux de transmission" style={{ marginTop: '2rem' }}>
    <Line data={data} options={options} aria-label="Courbe du taux de transmission" role="img" />
  </section>
);

export default LineChart; 