import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FaHome, FaChartBar, FaUniversalAccess, FaQuestionCircle } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import Accessibility from './components/Accessibility';
import Help from './components/Help';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { AccessibilityProvider, AccessibilityContext } from './context/AccessibilityContext';

const Home = () => (
  <main>
    <h1 tabIndex="0">Accueil</h1>
    <p>Bienvenue sur l'application de prédiction OMS. Utilisez le menu pour accéder au tableau de bord ou aux options d'accessibilité.</p>
  </main>
);

function AppContent() {
  const { fontSize, darkMode } = useContext(AccessibilityContext);
  return (
    <div style={{ fontSize: `${fontSize}px`, background: darkMode ? '#181818' : '#fff', color: darkMode ? '#fff' : '#222', minHeight: '100vh' }}>
      <Router>
        <nav aria-label="Menu principal">
          <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
            <li><Link to="/"><FaHome aria-label="Accueil" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Accueil</Link></li>
            <li><Link to="/dashboard"><FaChartBar aria-label="Dashboard" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Dashboard</Link></li>
            <li><Link to="/accessibilite"><FaUniversalAccess aria-label="Accessibilité" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Accessibilité</Link></li>
            <li><Link to="/aide"><FaQuestionCircle aria-label="Aide" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Aide</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accessibilite" element={<Accessibility />} />
          <Route path="/aide" element={<Help />} />
        </Routes>
        <BackToTop />
        <Footer />
      </Router>
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}

export default App;
