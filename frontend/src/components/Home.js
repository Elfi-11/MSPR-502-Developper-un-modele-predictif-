import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home-page">
    <header className="home-header">
      <h1 className="home-title">Analyze IT 2 - Tableau de bord</h1>
    </header>
    <main className="home-container">
      <div className="card-grid">
        <Link to="/predictions" className="home-card">
          <h2>Voir les prédictions</h2>
          <p>Consultez les prédictions générées par le modèle.</p>
        </Link>
        <Link to="/archives" className="home-card">
          <h2>Voir les données archives</h2>
          <p>Accédez à l'historique des données archivées.</p>
        </Link>
        <Link to="/comparaisons" className="home-card">
          <h2>Voir les comparaisons</h2>
          <p>Comparez les différentes données et prédictions.</p>
        </Link>
      </div>
    </main>
  </div>
);

export default Home;
