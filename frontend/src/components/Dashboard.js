import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DataTable from './DataTable';
import LineChart from './LineChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const annees = ['2023', '2024'];

const allData = {
  labels: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  datasets: [
    {
      label: 'Cas prédits',
      data: [120, 190, 300, 500, 200, 150, 180, 210, 250, 300, 320, 400],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const allDataByYear = {
  '2023': { ...allData },
  '2024': { ...allData }
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
      text: 'Évolution prédite des cas',
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
        text: 'Nombre de cas',
        color: '#222',
        font: { size: 16 },
      },
      ticks: { color: '#222' },
    },
  }
};

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [highContrast, setHighContrast] = useState(false);

  const yearData = allDataByYear[selectedYear];

  const filteredData = {
    ...yearData,
    labels: selectedMonth === 'all' ? yearData.labels : [selectedMonth],
    datasets: [
      {
        ...yearData.datasets[0],
        data:
          selectedMonth === 'all'
            ? yearData.datasets[0].data
            : [yearData.datasets[0].data[yearData.labels.indexOf(selectedMonth)]],
      },
    ],
  };

  return (
    <main style={{ background: highContrast ? '#000' : '#fff', color: highContrast ? '#fff' : '#222', minHeight: '100vh', padding: '1rem' }}>
      <button
        onClick={() => setHighContrast(!highContrast)}
        aria-pressed={highContrast}
        style={{ marginBottom: '1rem' }}
        title="Active ou désactive le contraste élevé pour une meilleure visibilité"
      >
        {highContrast ? 'Mode normal' : 'Contraste élevé'}
      </button>
      <div
        style={{
          background: '#e3f2fd',
          color: '#1976d2',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          fontSize: '1rem'
        }}
        role="status"
        aria-live="polite"
      >
        Utilisez les filtres ci-dessous pour explorer les prédictions par année et par mois. Passez la souris sur les éléments pour obtenir de l'aide.
      </div>
      <h1 tabIndex="0">Tableau de bord prédictif</h1>
      <section aria-label="Filtres du graphique">
        <label htmlFor="annee-select" title="Choisissez l'année à afficher">Année : </label>
        <select
          id="annee-select"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          aria-label="Filtrer les données par année"
          title="Filtrer les données par année"
        >
          {annees.map((annee) => (
            <option key={annee} value={annee}>{annee}</option>
          ))}
        </select>
        <label htmlFor="mois-select" style={{marginLeft: '1rem'}} title="Choisissez le mois à afficher">Mois : </label>
        <select
          id="mois-select"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          aria-label="Filtrer les données par mois"
          title="Filtrer les données par mois"
        >
          <option value="all">Tous</option>
          {yearData.labels.map((mois) => (
            <option key={mois} value={mois}>{mois}</option>
          ))}
        </select>
      </section>
      <section aria-label="Graphique d'évolution des cas prédits">
        <Bar data={filteredData} options={options} aria-label="Graphique des cas prédits" role="img" />
      </section>
      <DataTable />
      <LineChart />
    </main>
  );
};

export default Dashboard;