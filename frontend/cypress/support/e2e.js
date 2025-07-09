// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for COVID Archives page
Cypress.Commands.add('waitForCovidData', () => {
  cy.intercept('GET', '**/api/pays*').as('getPays')
  cy.intercept('GET', '**/api/covid*').as('getCovidData')
  
  cy.wait('@getPays', { timeout: 15000 })
  cy.wait('@getCovidData', { timeout: 15000 })
})

Cypress.Commands.add('selectCountry', (countryName) => {
  cy.get('[data-testid="country-filter"]').click()
  cy.get(`[data-testid="country-option-${countryName}"]`).click()
  cy.get('body').click(0, 0) // Close dropdown
})

Cypress.Commands.add('verifyChartExists', (metric) => {
  cy.get(`[data-testid="chart-${metric}"]`).should('be.visible')
  cy.get(`[data-testid="chart-${metric}"] canvas`).should('exist')
})