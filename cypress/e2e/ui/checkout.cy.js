describe('SauceDemo checkout', () => {
  it(
    'completes a full checkout with valid data and reaches the confirmation page',
    { tags: ['@smoke', '@regression'] },
    () => {
      cy.sauceLogin('standard_user', 'secret_sauce');
      cy.sauceAddToCartByName('Sauce Labs Backpack');
      cy.sauceCompleteCheckout('Mario', 'Rossi', '20100');

      cy.get('.complete-header').should('contain.text', 'Thank you for your order');
    },
  );
});
