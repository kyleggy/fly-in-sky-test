const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
      // Pass CI environment variable to Cypress
      config.env.CI = process.env.CI || false
      return config
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Enable videos for all test runs in CI, fail-only for local runs
    video: process.env.CI === 'true' || process.env.CYPRESS_VIDEO === 'true', // Only record videos in CI or when explicitly enabled
    videoOnFailOnly: false, // Keep all videos when recorded
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
      showHooks: 'always',
      saveJson: true  // Saves JSON data file for programmatic access
    }
  },
});
