const { Application } = require('spectron');
const path = require('path');

module.exports = {
  initializeSpectron() {
    const electronPath = path.join(__dirname, '../node_modules', '.bin', 'electron');
    const appPath = path.join(__dirname, '..');

    return new Application({
      path: electronPath,
      args: [appPath],
    });
  },
};
