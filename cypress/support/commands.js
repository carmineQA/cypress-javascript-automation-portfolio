Cypress.Commands.add('sauceLogin', (username, password) => {
  cy.visit('/');
  cy.get('[data-test="username"]').type(username);
  cy.get('[data-test="password"]').type(password);
  cy.get('[data-test="login-button"]').click();
});

Cypress.Commands.add('sauceAddToCartByName', (productName) => {
  cy.contains('.inventory_item', productName).within(() => {
    cy.get('button').click();
  });
});

Cypress.Commands.add('sauceLogout', () => {
  cy.get('#react-burger-menu-btn').click();
  cy.get('#logout_sidebar_link').click();
});

Cypress.Commands.add('sauceCompleteCheckout', (firstName, lastName, postalCode) => {
  cy.get('.shopping_cart_link').click();
  cy.get('[data-test="checkout"]').click();
  cy.get('[data-test="firstName"]').type(firstName);
  cy.get('[data-test="lastName"]').type(lastName);
  cy.get('[data-test="postalCode"]').type(postalCode);
  cy.get('[data-test="continue"]').click();
  cy.get('[data-test="finish"]').click();
});
