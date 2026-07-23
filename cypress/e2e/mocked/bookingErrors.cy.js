/**
 * These scenarios stub the network layer with cy.intercept() instead of hitting the real
 * Restful Booker API, because a 500 error, a slow response, or a malformed payload can't be
 * forced on demand against the real public API used by cypress/e2e/api/booking.cy.js. The page
 * under test is a small local harness (cypress/fixtures/pages/booking-viewer.html) that fetches
 * a booking and renders either its details or an error message — see docs/decisions.md.
 */
describe('Booking viewer - network error handling (mocked)', { baseUrl: null }, () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/booking-viewer.html');
  });

  it('shows an error message when the API returns a 500', { tags: ['@regression'] }, () => {
    cy.intercept('GET', '**/booking/1', { statusCode: 500 }).as('getBooking');

    cy.get('#load-booking').click();
    cy.wait('@getBooking');

    cy.get('#status').should('contain.text', 'Error: could not load booking (status 500)');
  });

  it(
    'shows an error message when the API returns an incomplete payload',
    { tags: ['@regression'] },
    () => {
      cy.intercept('GET', '**/booking/1', { statusCode: 200, body: { lastname: 'Rossi' } }).as(
        'getBooking',
      );

      cy.get('#load-booking').click();
      cy.wait('@getBooking');

      cy.get('#status').should('contain.text', 'Error: booking data is incomplete');
    },
  );

  it('shows a loading state while the API response is delayed', { tags: ['@regression'] }, () => {
    cy.intercept('GET', '**/booking/1', {
      statusCode: 200,
      body: { firstname: 'Mario', lastname: 'Rossi' },
      delay: 1000,
    }).as('getBooking');

    cy.get('#load-booking').click();
    cy.get('#status').should('contain.text', 'Loading...');
    cy.wait('@getBooking');
    cy.get('#status').should('contain.text', 'Loaded');
    cy.get('#booking-details').should('contain.text', 'Mario Rossi');
  });
});
