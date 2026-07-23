const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  retries: {
    runMode: process.env.CI ? 2 : 0,
    openMode: 0,
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'mochawesome-report',
    charts: true,
    overwrite: false,
    html: true,
    json: true,
  },
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    env: {
      apiUrl: 'https://restful-booker.herokuapp.com',
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/plugin').plugin(config);
      config.env.RESTFUL_BOOKER_USERNAME = process.env.RESTFUL_BOOKER_USERNAME;
      config.env.RESTFUL_BOOKER_PASSWORD = process.env.RESTFUL_BOOKER_PASSWORD;
      return config;
    },
  },
});
