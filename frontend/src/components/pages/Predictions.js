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
import { fetchCountries } from '../../services/api';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Couleurs pour les pays (on en définit plus pour avoir assez de couleurs)
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
        // Ne plus sélectionner automatiquement les 5 premiers pays
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
            // Limiter à 5 pays maximum
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
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                style={{
                  backgroundColor: COUNTRY_COLORS[option] || '#e0e0e0',
                  color: 'white'
                }}
              />
            ))
          }
          loading={loading}
          disabled={loading}
          sx={{ width: '100%' }}
        />
      </Box>

      {loading ? (
        <Typography>Chargement des données...</Typography>
      ) : (
        <Typography>
          {availableCountries.length} pays disponibles
        </Typography>
      )}
    </Container>
  );
};

export default Predictions; 