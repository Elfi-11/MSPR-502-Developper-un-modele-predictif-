import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3>Évolution de la Transmission - Nouveaux Cas</h3>
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
            formatter={(value) => [value, 'Nouveaux cas']}
            labelFormatter={(label) => `Mois: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cases" 
            stroke="#2563eb" 
            strokeWidth={3}
            name="Nouveaux cas"
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransmissionChart; 