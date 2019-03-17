const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const deepmerge = require('deepmerge');
const logger = require('./logger');

const dataentConf = 'dataent.conf.js';

function getAppDir() {
  let dir = process.cwd();

  if (fs.existsSync(path.join(dir, dataentConf))) {
    return dir;
  }

  warn = logger('utils', 'red')

  warn();
  warn(`Looks like this is not the root of a dataentJS project`);
  warn(`Please run this command from a folder which contains ${chalk.yellow(dataentConf)} file`);
  warn();
  process.exit(1);
}

function getAppConfig() {
  const defaults = {
    dev: {
      devServerHost: 'localhost',
      devServerPort: 8000
    }
  }
  const appConfig = require(path.resolve(getAppDir(), dataentConf));
  return deepmerge(defaults, appConfig);
}

function resolveAppDir(...args) {
  return path.resolve(getAppDir(), ...args);
}

module.exports = {
  getAppDir,
  getAppConfig,
  resolveAppDir
}