// cypress.config.js
const { defineConfig } = require('cypress');

const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const {
  addCucumberPreprocessorPlugin,
} = require('@badeball/cypress-cucumber-preprocessor');
const {
  createEsbuildPlugin,
} = require('@badeball/cypress-cucumber-preprocessor/esbuild');

async function setupNodeEvents(cypressOn, config) {
  // Fix multiple plugins subscribing to the same events
  const on = require('cypress-on-fix')(cypressOn);

  // Required for the Cucumber preprocessor
  await addCucumberPreprocessorPlugin(on, config);

  // Recommended fast bundler: esbuild
  on(
    'file:preprocessor',
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    })
  );

  // Mochawesome reporter plugin hook
  require('cypress-mochawesome-reporter/plugin')(on);

  return config;
}

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.demoblaze.com',
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents,
  },

  // Mochawesome reporter
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    reportFilename: 'index',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false
  },

  // Reduce CI flakes
  retries: {
    runMode: 2,
    openMode: 0
  },

  video: true,
  screenshotOnRunFailure: true,

  // Demoblaze is simple; these timeouts are conservative
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000,
  viewportWidth: 1280,
  viewportHeight: 720,

  env: {
    // You can override via CYPRESS_DEMOBLAZE_PASSWORD, CYPRESS_FAKER_SEED, CYPRESS_RUN_ID
    DEMOBLAZE_PASSWORD: process.env.CYPRESS_DEMOBLAZE_PASSWORD || 'Test1234!',
    FAKER_SEED: Number(process.env.CYPRESS_FAKER_SEED || 12345),

    // Uniqueness in CI, and still deterministic within a given run
    RUN_ID:
      process.env.CYPRESS_RUN_ID ||
      (process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || '1'}`
        : `local-${Date.now()}`)
  }
});
