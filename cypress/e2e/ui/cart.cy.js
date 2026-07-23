describe('SauceDemo cart', () => {
  beforeEach(() => {
    cy.sauceLogin('standard_user', 'secret_sauce');
  });

  it('updates the badge count when a product is added', { tags: ['@smoke', '@regression'] }, () => {
    cy.sauceAddToCartByName('Sauce Labs Backpack');

    cy.get('.shopping_cart_badge').should('have.text', '1');
  });

  it('updates the badge and contents when a product is removed', { tags: ['@regression'] }, () => {
    cy.sauceAddToCartByName('Sauce Labs Backpack');
    cy.sauceAddToCartByName('Sauce Labs Bike Light');
    cy.get('.shopping_cart_link').click();

    cy.contains('.cart_item', 'Sauce Labs Backpack').within(() => {
      cy.get('button').click();
    });

    cy.get('.cart_item').should('have.length', 1);
    cy.contains('.cart_item', 'Sauce Labs Bike Light').should('exist');
  });
});
