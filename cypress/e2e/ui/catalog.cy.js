describe('SauceDemo catalog sorting', () => {
  beforeEach(() => {
    cy.sauceLogin('standard_user', 'secret_sauce');
  });

  it('sorts products by name A to Z', { tags: ['@regression'] }, () => {
    cy.get('.product_sort_container').select('Name (A to Z)');

    cy.get('.inventory_item_name')
      .then(($items) => Cypress._.map($items, 'innerText'))
      .then((names) => {
        const sorted = [...names].sort();
        expect(names).to.deep.equal(sorted);
      });
  });

  it('sorts products by name Z to A', { tags: ['@regression'] }, () => {
    cy.get('.product_sort_container').select('Name (Z to A)');

    cy.get('.inventory_item_name')
      .then(($items) => Cypress._.map($items, 'innerText'))
      .then((names) => {
        const sorted = [...names].sort().reverse();
        expect(names).to.deep.equal(sorted);
      });
  });
});
