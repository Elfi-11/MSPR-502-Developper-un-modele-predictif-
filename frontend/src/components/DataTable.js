import React, { useState } from 'react';

const annees = ['2023', '2024'];
const mois = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Exemple de données simulées (à remplacer par les vraies données plus tard)
const data = [
  { annee: '2023', mois: 'Janvier', pays: 'France', cas: 120, morts: 2 },
  { annee: '2023', mois: 'Février', pays: 'France', cas: 190, morts: 3 },
  { annee: '2023', mois: 'Mars', pays: 'France', cas: 300, morts: 5 },
  { annee: '2024', mois: 'Janvier', pays: 'France', cas: 150, morts: 1 },
  { annee: '2024', mois: 'Février', pays: 'France', cas: 180, morts: 2 },
  { annee: '2024', mois: 'Mars', pays: 'France', cas: 210, morts: 2 },
  // ...ajoute d'autres lignes pour d'autres pays/mois/années
];

const paysList = ['France']; // À étendre selon les données

const DataTable = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const filteredData = data.filter(row =>
    (selectedYear === 'all' || row.annee === selectedYear) &&
    (selectedMonth === 'all' || row.mois === selectedMonth) &&
    (selectedCountry === 'all' || row.pays === selectedCountry)
  );

  return (
    <section aria-label="Tableau de données filtrable" style={{marginTop: '2rem'}}>
      <h2>Tableau de données</h2>
      <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
        <label htmlFor="annee-table-select">Année :</label>
        <select id="annee-table-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value="all">Toutes</option>
          {annees.map(annee => <option key={annee} value={annee}>{annee}</option>)}
        </select>
        <label htmlFor="mois-table-select">Mois :</label>
        <select id="mois-table-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="all">Tous</option>
          {mois.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <label htmlFor="pays-table-select">Pays :</label>
        <select id="pays-table-select" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
          <option value="all">Tous</option>
          {paysList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <caption className="sr-only">Tableau des données de prédiction</caption>
        <thead>
          <tr>
            <th>Année</th>
            <th>Mois</th>
            <th>Pays</th>
            <th>Cas prédits</th>
            <th>Mortalité prédite</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr><td colSpan="5">Aucune donnée pour ce filtre.</td></tr>
          ) : (
            filteredData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.annee}</td>
                <td>{row.mois}</td>
                <td>{row.pays}</td>
                <td>{row.cas}</td>
                <td>{row.morts}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default DataTable; 