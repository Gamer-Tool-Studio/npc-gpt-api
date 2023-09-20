const Logger = require('debug');

const { appName: name } = require('src/config');

const Factory = {
  getLogger: (moduleName: string) => {
    return {
      logError: Logger(`${name}:error:${moduleName}`),
      logDebug: Logger(`${name}:${moduleName}`),
    };
  },

  getErrorLogger: (moduleName: string) => {
    return Logger(`secret-gpt:error:${moduleName}`);
  },

  getWarnLogger: (moduleName: string) => {
    return Logger(`secret-gpt:warn:${moduleName}`);
  },

  getInfoLogger: (moduleName: string) => {
    return Logger(`secret-gpt:info:${moduleName}`);
  },

  getDebugLogger: (moduleName: string) => {
    return Logger(`secret-gpt:debug:${moduleName}`);
  },
};

export = Factory;
