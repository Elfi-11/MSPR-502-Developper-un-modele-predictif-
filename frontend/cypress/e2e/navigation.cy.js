/// <reference types="cypress" />

describe('Application Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the home page with title and cards', () => {
    cy.get('body').should('be.visible')
    cy.url().should('eq', 'http://localhost:5173/')
    
    // Vérifier le titre principal
    cy.get('.home-title').should('contain', 'Analyze IT 2 - Tableau de bord')
    
    // Vérifier que les 3 cards sont présentes
    cy.get('.home-card').should('have.length', 3)
    
    // Vérifier le contenu des cards
    cy.get('.home-card').eq(0).should('contain', 'Voir les prédictions')
    cy.get('.home-card').eq(1).should('contain', 'Voir les données archives')
    cy.get('.home-card').eq(2).should('contain', 'Voir les comparaisons')
  })

  it('should navigate to Archives page from home card', () => {
    // Cliquer sur la card Archives
    cy.get('.home-card').contains('Voir les données archives').click()
    
    // Vérifier que nous sommes sur la page Archives
    cy.url().should('include', '/archives')
    
    // Vérifier le contenu de la page Archives
    cy.get('h1').should('contain', 'Archives')
  })

  it('should navigate to Predictions page from home card', () => {
    // Cliquer sur la card Prédictions
    cy.get('.home-card').contains('Voir les prédictions').click()
    
    // Vérifier que nous sommes sur la page Prédictions
    cy.url().should('include', '/predictions')
  })

  it('should navigate to Comparisons page from home card', () => {
    // Cliquer sur la card Comparaisons
    cy.get('.home-card').contains('Voir les comparaisons').click()
    
    // Vérifier que nous sommes sur la page Comparaisons
    cy.url().should('include', '/comparaisons')
  })

  it('should have responsive navigation', () => {
    // Test sur mobile
    cy.viewport(375, 667)
    cy.get('.home-card').should('be.visible')
    cy.get('.home-title').should('be.visible')
    
    // Test sur tablette
    cy.viewport(768, 1024)
    cy.get('.home-card').should('be.visible')
    cy.get('.home-title').should('be.visible')
    
    // Test sur desktop
    cy.viewport(1280, 720)
    cy.get('.home-card').should('be.visible')
    cy.get('.home-title').should('be.visible')
  })

  it('should handle page refresh correctly', () => {
    // Naviguer vers Archives depuis la home
    cy.get('.home-card').contains('Voir les données archives').click()
    cy.url().should('include', '/archives')
    
    // Rafraîchir la page
    cy.reload()
    
    // Vérifier que nous sommes toujours sur la bonne page
    cy.url().should('include', '/archives')
    cy.get('h1').should('contain', 'Archives')
  })

  it('should display home page layout correctly', () => {
    // Vérifier la structure générale de la page d'accueil
    cy.get('.home-page').should('be.visible')
    cy.get('.home-header').should('be.visible')
    cy.get('.home-container').should('be.visible')
    cy.get('.card-grid').should('be.visible')
    
    // Vérifier que les cards sont cliquables
    cy.get('.home-card').each(($card) => {
      cy.wrap($card).should('have.attr', 'href')
    })
  })
})
