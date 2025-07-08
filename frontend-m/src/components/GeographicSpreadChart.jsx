import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GeographicSpreadChart = ({ predictionsData, locations, isLoading }) => {
  if (isLoading) {
    return <div>Chargement des données géographiques...</div>;
  }

  // Traitement simple des données
  const processData = () => {
    if (!predictionsData || !locations) return [];

    // Filtrer les données de propagation géographique
    const geoData = predictionsData.filter(item => item.indicateur === 'countries_reporting');
    
    if (geoData.length === 0) return [];

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
    return Object.entries(groupedData).map(([month, value]) => ({
      month,
      countries: Math.round(value)
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const data = processData();

  if (data.length === 0) {
    return <div>Aucune donnée de propagation géographique disponible.</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3>Propagation Géographique - Pays Rapportant des Cas</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, 'Pays rapportant']}
            labelFormatter={(label) => `Mois: ${label}`}
          />
          <Legend />
          <Bar dataKey="countries" fill="#8884d8" name="Pays rapportant" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GeographicSpreadChart; 