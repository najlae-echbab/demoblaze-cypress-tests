// cypress/support/commands.js

/**
 * Stub window.alert and keep it as an alias.
 * Use before the click that triggers the alert.
 */
Cypress.Commands.add('stubAlert', (alias = 'alert') => {
  cy.window({ log: false }).then((win) => {
    // Restore if already stubbed (safety)
    if (win.alert && win.alert.restore) {
      win.alert.restore();
    }
    cy.stub(win, 'alert').as(alias);
  });
});

/**
 * Close a Bootstrap modal safely if it is visible.
 * This avoids occasional "modal stays open" flakiness.
 */
Cypress.Commands.add('closeModalIfOpen', (modalSelector) => {
  cy.get('body', { log: false }).then(($body) => {
    const $modal = $body.find(modalSelector);
    if ($modal.length && $modal.is(':visible')) {
      cy.wrap($modal, { log: false }).within(() => {
        // "Close" button exists in Demoblaze modals
        cy.contains('button', 'Close').click({ force: true });
      });
    }
  });
});

/**
 * Wait for product cards to be present on Home.
 * Prefer assertion-based waiting over cy.wait(ms).
 */
Cypress.Commands.add('waitForHomeProducts', () => {
  cy.get('#tbodyid', { timeout: 20000 }).should('be.visible');
  cy.get('#tbodyid .card').should('have.length.greaterThan', 0);
});
