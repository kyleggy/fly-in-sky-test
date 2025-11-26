const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: [
      'cypress/e2e/1-getting-started/**',
      'cypress/e2e/2-advanced-examples/**'
    ],
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      inlineAssets: true,
      charts: true,
      reportPageTitle: 'Kong API Gateway Test Report',
      reportFilename: 'kong-api-gateway-test-report',
      timestamp: 'yyyy-mm-dd_HH-MM-ss',
      embeddedScreenshots: true,
      videoOnFailOnly: true
    }
  },
});
