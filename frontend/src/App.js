import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Accessibility from './components/pages/Accessibility';
import Help from './components/pages/Help';
import Footer from './components/footer/Footer';
import BackToTop from './components/BackToTop';
import Header from './components/header/Header';
import Home from './components/pages/Home';
import Predictions from './components/pages/Predictions';
import Archives from './components/pages/Archives';
import Comparaisons from './components/pages/Comparaisons';
import { AccessibilityProvider, AccessibilityContext } from './context';

function AppLayout() {
  const { fontSize, darkMode } = useContext(AccessibilityContext);
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
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App;
