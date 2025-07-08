import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MortalityChart = ({ predictionsData, locations, isLoading }) => {
  if (isLoading) {
    return <div>Chargement des données de mortalité...</div>;
  }

  // Traitement simple des données
  const processData = () => {
    if (!predictionsData || !locations) return [];

    // Filtrer les données de mortalité
    const mortalityData = predictionsData.filter(item => item.indicateur === 'new_deaths');
    
    if (mortalityData.length === 0) return [];

    // Regrouper par mois
    const groupedData = {};
    mortalityData.forEach(item => {
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
      deaths: Math.round(value * 100) / 100 // Arrondir à 2 décimales
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const data = processData();

  if (data.length === 0) {
    return <div>Aucune donnée de mortalité disponible.</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3>Évolution de la Mortalité - Nouveaux Décès</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, 'Nouveaux décès']}
            labelFormatter={(label) => `Mois: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="deaths" 
            stroke="#dc2626" 
            strokeWidth={3}
            name="Nouveaux décès"
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MortalityChart; 