describe('SauceDemo login', () => {
  it(
    'logs in with standard_user and reaches the inventory page',
    { tags: ['@smoke', '@regression'] },
    () => {
      cy.sauceLogin('standard_user', 'secret_sauce');

      cy.url().should('include', '/inventory.html');
      cy.get('.inventory_item').should('have.length.greaterThan', 0);
    },
  );

  it(
    'shows a lockout error message for locked_out_user',
    { tags: ['@smoke', '@regression'] },
    () => {
      cy.sauceLogin('locked_out_user', 'secret_sauce');

      cy.get('[data-test="error"]').should('be.visible').and('contain.text', 'locked out');
    },
  );
});
