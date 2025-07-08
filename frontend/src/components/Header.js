import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { darkMode } = useContext(AccessibilityContext);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`modern-header ${darkMode ? 'dark' : ''}`} role="banner">
      <div className="header-container">
        <div className="header-logo">
          <span className="logo-text">Analyze IT 2</span>
        </div>
        
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>

        <nav 
          id="main-navigation" 
          className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          role="navigation"
          aria-label="Navigation principale"
        >
          <Link 
            to="/predictions" 
            className={`nav-link ${isActive('/predictions') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/predictions') ? 'page' : undefined}
          >
            Prédictions
          </Link>
          <Link 
            to="/archives" 
            className={`nav-link ${isActive('/archives') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/archives') ? 'page' : undefined}
          >
            Archives
          </Link>
          <Link 
            to="/comparaisons" 
            className={`nav-link ${isActive('/comparaisons') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/comparaisons') ? 'page' : undefined}
          >
            Comparaisons
          </Link>
          <Link 
            to="/accessibilite" 
            className={`nav-link ${isActive('/accessibilite') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/accessibilite') ? 'page' : undefined}
          >
            Accessibilité
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
