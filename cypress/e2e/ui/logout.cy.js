describe('SauceDemo logout', () => {
  it('redirects back to the login page', { tags: ['@regression'] }, () => {
    cy.sauceLogin('standard_user', 'secret_sauce');
    cy.sauceLogout();

    cy.url().should('eq', 'https://www.saucedemo.com/');
  });
});
