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
    const url = `${API_BASE_URL}/pays?limit=1000`; // Augmentation de la limite à 1000 pays
    console.log('🌍 Fetching countries from:', url);
    console.log('🌍 Full URL:', window.location.origin + url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('🌍 Response status:', response.status);
    console.log('🌍 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌍 Error response:', errorText);
      throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🌍 Received countries data:', data);
    return data;
  } catch (error) {
    console.error('🌍 Erreur lors de la récupération des pays:', error);
    throw error;
  }
};

/**
 * Récupère les données COVID-19 pour plusieurs pays
 * @param {Object} filters - Filtres à appliquer
 * @param {Array} filters.countries - Liste des pays sélectionnés avec {location_id, location_name}
 * @param {Date} filters.startDate - Date de début
 * @param {Date} filters.endDate - Date de fin
 */
export const fetchCovidData = async (filters = {}) => {
  try {
    if (!filters.countries || filters.countries.length === 0) {
      return {};
    }

    // Créer une promesse pour chaque pays
    const promises = filters.countries.map(async (country) => {
      const url = new URL(`${API_BASE_URL}/covid/`, window.location.origin);
      
      url.searchParams.append('location_id', country.location_id);
      
      if (filters.startDate) {
        url.searchParams.append('start_date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      
      if (filters.endDate) {
        url.searchParams.append('end_date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      
      url.searchParams.append('limit', '2000');

      console.log(`Fetching COVID data for ${country.location_name}:`, url.toString());

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response for ${country.location_name}:`, errorText);
        throw new Error(`Erreur HTTP: ${response.status} pour ${country.location_name}`);
      }
      
      const data = await response.json();
      return {
        country: country.location_name,
        countryId: country.location_id,
        data: data
      };
    });

    const results = await Promise.all(promises);
    
    // Organiser les résultats par pays
    const organizedData = {};
    results.forEach(result => {
      organizedData[result.country] = result.data;
    });

    console.log('Organized COVID data:', organizedData);
    return organizedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données COVID:', error);
    throw error;
  }
};