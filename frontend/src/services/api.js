import { format } from 'date-fns';

// Configuration de l'API
const API_BASE_URL = '/api';

export const fetchCountries = async () => {
  try {
    const url = `${API_BASE_URL}/predictions/countries`;
    console.log('Fetching countries from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    throw error;
  }
};

/**
 * Récupère les prédictions pour plusieurs pays
 * @param {Object} params
 * @param {string} params.indicateur - Type de prédiction ("new_cases", "new_deaths", "countries_reporting")
 * @param {Array} params.pays - Liste des pays sélectionnés
 * @param {Date} params.dateDebut - Date de début des prédictions
 * @param {Date} params.dateFin - Date de fin des prédictions
 */
export const fetchMultiCountryPredictions = async (params) => {
  try {
    // Créer un tableau de promesses pour chaque pays
    const promises = params.pays.map(async (pays) => {
      // Construction de l'URL avec les paramètres
      const url = new URL(`${API_BASE_URL}/predictions/`, window.location.origin);
      
      // Ajout des paramètres
      url.searchParams.append('indicateur', params.indicateur || 'new_cases');
      url.searchParams.append('location_id', pays.location_id);
      
      if (params.dateDebut) {
        url.searchParams.append('date_debut', format(params.dateDebut, 'yyyy-MM-dd'));
      }
      if (params.dateFin) {
        url.searchParams.append('date_fin', format(params.dateFin, 'yyyy-MM-dd'));
      }

      console.log('Fetching URL:', url.toString()); 

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        pays: pays.location_name,
        predictions: data
      };
    });

    return Promise.all(promises);
  } catch (error) {
    console.error('Erreur lors de la récupération des prédictions:', error);
    throw error;
  }
};

export const fetchPredictions = async (year) => {
  try {
    const url = `${API_BASE_URL}/predictions/all-predictions/${year}`;
    console.log('Fetching predictions from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des prédictions:', error);
    throw error;
  }
};

export const fetchPredictionById = async (id) => {
  try {
    const url = `${API_BASE_URL}/predictions/${id}`;
    console.log('Fetching prediction by ID from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la prédiction:', error);
    throw error;
  }
};

/**
 * Récupère la liste des pays disponibles
 */
export const fetchLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pays`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    throw error;
  }
}; 