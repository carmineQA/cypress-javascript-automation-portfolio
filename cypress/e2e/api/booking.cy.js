const validPayload = {
  firstname: 'Mario',
  lastname: 'Rossi',
  totalprice: 150,
  depositpaid: true,
  bookingdates: {
    checkin: '2026-01-01',
    checkout: '2026-01-05',
  },
  additionalneeds: 'Breakfast',
};

describe('Restful Booker API', () => {
  const apiUrl = Cypress.env('apiUrl');

  it('ping confirms the API is up', { tags: ['@smoke', '@regression'] }, () => {
    cy.request(`${apiUrl}/ping`).its('status').should('eq', 201);
  });

  it('creating a booking returns the expected shape', { tags: ['@regression'] }, () => {
    cy.request('POST', `${apiUrl}/booking`, validPayload).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('bookingid', 'booking');
      expect(response.body.booking).to.include({
        firstname: validPayload.firstname,
        lastname: validPayload.lastname,
        totalprice: validPayload.totalprice,
        depositpaid: validPayload.depositpaid,
      });
    });
  });

  it(
    'create, read, update and delete a booking (full CRUD flow)',
    { tags: ['@regression'] },
    () => {
      const username = Cypress.env('RESTFUL_BOOKER_USERNAME');
      const password = Cypress.env('RESTFUL_BOOKER_PASSWORD');
      expect(username, 'RESTFUL_BOOKER_USERNAME env var').to.be.a('string').and.not.be.empty;
      expect(password, 'RESTFUL_BOOKER_PASSWORD env var').to.be.a('string').and.not.be.empty;

      cy.request('POST', `${apiUrl}/auth`, { username, password }).then((authResponse) => {
        const token = authResponse.body.token;

        cy.request('POST', `${apiUrl}/booking`, validPayload).then((createResponse) => {
          expect(createResponse.status).to.eq(200);
          const bookingId = createResponse.body.bookingid;

          cy.request('GET', `${apiUrl}/booking/${bookingId}`).then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            expect(getResponse.body.firstname).to.eq(validPayload.firstname);
          });

          const updatedPayload = { ...validPayload, totalprice: 200 };
          cy.request({
            method: 'PUT',
            url: `${apiUrl}/booking/${bookingId}`,
            body: updatedPayload,
            headers: { Cookie: `token=${token}` },
          }).then((updateResponse) => {
            expect(updateResponse.status).to.eq(200);
            expect(updateResponse.body.totalprice).to.eq(200);
          });

          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/booking/${bookingId}`,
            headers: { Cookie: `token=${token}` },
          })
            .its('status')
            .should('eq', 201);
        });
      });
    },
  );

  it(
    'creating a booking without the required firstname field returns an error',
    { tags: ['@regression'] },
    () => {
      // eslint-disable-next-line no-unused-vars
      const { firstname, ...invalidPayload } = validPayload;

      cy.request({
        method: 'POST',
        url: `${apiUrl}/booking`,
        body: invalidPayload,
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 500);
    },
  );
});
