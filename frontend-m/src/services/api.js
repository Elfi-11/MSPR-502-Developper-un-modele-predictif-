const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  // Récupérer toutes les locations disponibles
  async getLocations() {
    try {
      const response = await fetch(`${API_BASE_URL}/pays/`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des locations');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API getLocations:', error);
      return [];
    }
  },

  // Récupérer toutes les prédictions de la base de données
  async getAllPredictionsFromDB() {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/?limit=50000`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des prédictions');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API getAllPredictionsFromDB:', error);
      return [];
    }
  }
}; 