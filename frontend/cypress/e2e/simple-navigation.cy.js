/// <reference types="cypress" />

describe('Simple Navigation Test', () => {
  it('should navigate through all main pages', () => {
    // Page d'accueil
    cy.visit('/')
    cy.get('.home-title').should('contain', 'Analyze IT 2 - Tableau de bord')
    cy.get('.home-card').should('have.length', 3)
    
    // Navigation vers Prédictions
    cy.get('.home-card').contains('Voir les prédictions').click()
    cy.url().should('include', '/predictions')
    cy.go('back')
    
    // Navigation vers Archives
    cy.get('.home-card').contains('Voir les données archives').click()
    cy.url().should('include', '/archives')
    cy.get('h1').should('contain', 'Archives')
    cy.go('back')
    
    // Navigation vers Comparaisons
    cy.get('.home-card').contains('Voir les comparaisons').click()
    cy.url().should('include', '/comparaisons')
    cy.go('back')
    
    // Retour à l'accueil
    cy.get('.home-title').should('be.visible')
  })

  it('should display home page cards correctly', () => {
    cy.visit('/')
    
    // Vérifier chaque card individuellement
    cy.get('.home-card').each(($card, index) => {
      cy.wrap($card).should('be.visible')
      cy.wrap($card).should('have.attr', 'href')
      
      // Vérifier le contenu selon l'index
      if (index === 0) {
        cy.wrap($card).should('contain', 'Voir les prédictions')
      } else if (index === 1) {
        cy.wrap($card).should('contain', 'Voir les données archives')
      } else if (index === 2) {
        cy.wrap($card).should('contain', 'Voir les comparaisons')
      }
    })
  })
})
