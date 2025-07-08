import React, { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

const Footer = () => {
  const { increaseFont, decreaseFont, resetFont, darkMode, toggleDarkMode } = useContext(AccessibilityContext);
  return (
    <footer style={{
      background: '#1976d2',
      color: '#fff',
      textAlign: 'center',
      padding: '1rem 0',
      marginTop: '2rem',
      width: '100%',
      fontSize: '1rem',
      letterSpacing: '0.5px'
    }}>
      <div>
        <b>OMS Prédiction IA</b> — Projet MSPR-502 &copy; {new Date().getFullYear()}<br />
        <a href="/aide" style={{ color: '#fff', textDecoration: 'underline', margin: '0 0.5rem' }}>Aide</a>
        <a href="/accessibilite" style={{ color: '#fff', textDecoration: 'underline', margin: '0 0.5rem' }}>Accessibilité</a>
        <a href="mailto:support@oms-projet.org" style={{ color: '#fff', textDecoration: 'underline', margin: '0 0.5rem' }}>Contact</a>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={decreaseFont} aria-label="Réduire la taille du texte" style={{ margin: '0 0.5rem' }}>A-</button>
        <button onClick={resetFont} aria-label="Taille normale" style={{ margin: '0 0.5rem' }}>A</button>
        <button onClick={increaseFont} aria-label="Agrandir la taille du texte" style={{ margin: '0 0.5rem' }}>A+</button>
        <button onClick={toggleDarkMode} aria-pressed={darkMode} aria-label="Activer/désactiver le mode sombre" style={{ margin: '0 0.5rem' }}>
          {darkMode ? 'Mode clair' : 'Mode sombre'}
        </button>
      </div>
    </footer>
  );
};

export default Footer; 