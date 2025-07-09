/// <reference types="cypress" />

describe('Basic App Tests', () => {
  it('should visit the application and load home page', () => {
    cy.visit('http://localhost:5173')
    cy.get('body').should('be.visible')
    
    // Vérifier que la page d'accueil se charge
    cy.get('.home-page').should('be.visible')
    cy.get('.home-title').should('contain', 'Analyze IT 2 - Tableau de bord')
  })

  it('should have correct page title', () => {
    cy.visit('http://localhost:5173')
    cy.title().should('include', 'Prédictions COVID-19')
  })

  it('should display all navigation cards', () => {
    cy.visit('http://localhost:5173')
    
    // Vérifier que les 3 cards de navigation sont présentes
    cy.get('.home-card').should('have.length', 3)
    
    // Vérifier le texte de chaque card
    cy.get('.home-card').eq(0).within(() => {
      cy.get('h2').should('contain', 'Voir les prédictions')
      cy.get('p').should('contain', 'Consultez les prédictions générées par le modèle')
    })
    
    cy.get('.home-card').eq(1).within(() => {
      cy.get('h2').should('contain', 'Voir les données archives')
      cy.get('p').should('contain', 'Accédez à l\'historique des données archivées')
    })
    
    cy.get('.home-card').eq(2).within(() => {
      cy.get('h2').should('contain', 'Voir les comparaisons')
      cy.get('p').should('contain', 'Comparez les différentes données et prédictions')
    })
  })
})
