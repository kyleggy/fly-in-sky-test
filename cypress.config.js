const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
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
      videoOnFailOnly: true,
      showHooks: 'always',
      saveJson: true  // Saves JSON data file for programmatic access
    }
  },
});
