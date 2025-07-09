import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Alert, 
  Box,
  Autocomplete,
  TextField,
  Chip
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchCountries, fetchPredictions } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Couleurs pour les pays
const COUNTRY_COLORS = {
  'Afghanistan': 'rgb(255, 99, 132)',   // Rouge
  'Albania': 'rgb(54, 162, 235)',       // Bleu
  'Algeria': 'rgb(255, 206, 86)',       // Jaune
  'Andorra': 'rgb(75, 192, 192)',       // Vert turquoise
  'Angola': 'rgb(153, 102, 255)',       // Violet
  'Argentina': 'rgb(255, 159, 64)',     // Orange
  'Australia': 'rgb(199, 199, 199)',    // Gris
  'Austria': 'rgb(83, 102, 255)',       // Bleu foncé
  'Brazil': 'rgb(255, 99, 132)',        // Rouge
  'China': 'rgb(255, 159, 64)',         // Orange
  'France': 'rgb(75, 192, 192)',        // Vert
  'Germany': 'rgb(153, 102, 255)',      // Violet
  'United States': 'rgb(255, 99, 132)'  // Rouge
};

const Predictions = () => {
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionsData, setPredictionsData] = useState(null);

  // Charger la liste des pays au montage du composant
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Chargement des pays...');
        
        const countries = await fetchCountries();
        console.log('Pays reçus:', countries);
        
        setAvailableCountries(countries);
        setSelectedCountries([]);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Charger les prédictions quand les pays sélectionnés changent
  useEffect(() => {
    const loadPredictions = async () => {
      if (selectedCountries.length === 0) {
        setPredictionsData(null);
        return;
      }

      try {
        setLoading(true);
        const predictionsData = await fetchPredictions(2025);
        console.log('Données brutes reçues:', predictionsData);
        
        // Initialiser les structures de données pour le calcul des sommes
        const monthlyData = {};
        selectedCountries.forEach(country => {
          monthlyData[country] = Array(12).fill(0);
        });

        // Pour chaque pays sélectionné, traiter ses prédictions
        selectedCountries.forEach(country => {
          if (predictionsData[country]) {
            console.log(`Données pour ${country}:`, predictionsData[country].slice(0, 5));
            predictionsData[country].forEach(pred => {
              const date = new Date(pred.date);
              const month = date.getMonth();
              // Utiliser la valeur directement sans division
              monthlyData[country][month] += parseFloat(pred.nouveaux_cas);
            });
          }
        });

        // Afficher les totaux pour debug
        selectedCountries.forEach(country => {
          console.log(`Totaux mensuels pour ${country}:`, [...monthlyData[country]]);
        });

        setPredictionsData({
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
          datasets: selectedCountries.map(country => ({
            label: country,
            data: monthlyData[country],
            borderColor: COUNTRY_COLORS[country] || '#' + Math.floor(Math.random()*16777215).toString(16),
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 2
          }))
        });

      } catch (error) {
        console.error('Erreur lors du chargement des prédictions:', error);
        setError('Erreur lors du chargement des prédictions');
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [selectedCountries]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Total mensuel des cas COVID-19 prédits pour 2025'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} cas au total`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre total de cas par mois'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prédictions COVID-19
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          multiple
          options={availableCountries}
          value={selectedCountries}
          onChange={(event, newValue) => {
            if (newValue.length <= 5) {
              setSelectedCountries(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sélectionner les pays (max 5)"
              placeholder={selectedCountries.length >= 5 ? "" : "Chercher un pays..."}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index });
              // Retirer la prop key du spread pour éviter le warning
              const { key, ...otherProps } = props;
              return (
                <Chip
                  key={key}
                  label={option}
                  {...otherProps}
                  style={{
                    backgroundColor: COUNTRY_COLORS[option] || '#e0e0e0',
                    color: 'white'
                  }}
                />
              );
            })
          }
          loading={loading}
          disabled={loading}
          sx={{ width: '100%' }}
        />
      </Box>

      {loading ? (
        <Typography>Chargement des données...</Typography>
      ) : (
        <>
          <Typography>
            {availableCountries.length} pays disponibles
          </Typography>
          
          {/* Graphique */}
          {predictionsData && (
            <Box sx={{ height: '500px', mt: 3 }}>
              <Line data={predictionsData} options={chartOptions} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Predictions; 