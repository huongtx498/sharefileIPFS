/* eslint-env node, mocha */
const chai = require('chai');
const chaiAsPromise = require('chai-as-promised');
const testHelper = require('./spectron-helper');

const app = testHelper.initializeSpectron();

global.before(() => {
  chai.should();
  chai.use(chaiAsPromise);
});

describe('Application launch', () => {
  // CSS selector
  // start spectron
  beforeEach(() => app.start());

  // stop spectron
  afterEach(() => app.stop());

  describe('login window', () => {
    it('#1: shows an initial window and tray icon', () => { app.client.getWindowCount().should.eventually.equal(2); });
  });
});
