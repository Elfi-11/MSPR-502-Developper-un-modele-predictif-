import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Accessibility from './components/Accessibility';
import Help from './components/Help';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import Header from './components/Header';
import Home from './components/Home';
import Predictions from './components/Predictions';
import Archives from './components/Archives';
import Comparaisons from './components/Comparaisons';
import { AccessibilityProvider, AccessibilityContext } from './context/AccessibilityContext';

function AppContent() {
  const { fontSize, darkMode } = useContext(AccessibilityContext);
  
  return (
    <Router>
      <AppLayout fontSize={fontSize} darkMode={darkMode} />
    </Router>
  );
}

function AppLayout({ fontSize, darkMode }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div style={{ 
      fontSize: `${fontSize}px`, 
      background: isHomePage ? 'transparent' : (darkMode ? '#181818' : '#f5f5f5'), 
      color: darkMode ? '#fff' : '#222', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {!isHomePage && <Header />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/comparaisons" element={<Comparaisons />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accessibilite" element={<Accessibility />} />
          <Route path="/aide" element={<Help />} />
        </Routes>
      </main>
      {!isHomePage && <BackToTop />}
      {!isHomePage && <Footer />}
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
