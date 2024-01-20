import Logger from 'debug';
import config from 'src/config';

const { appName: name } = config;

const Factory = {
  getLogger: (moduleName: string) => {
    return {
      logError: Logger(`${name}:error:${moduleName}`),
      logDebug: Logger(`${name}:${moduleName}`),
    };
  },

  getErrorLogger: (moduleName: string) => {
    return Logger(`${name}:error:${moduleName}`);
  },

  getWarnLogger: (moduleName: string) => {
    return Logger(`${name}:warn:${moduleName}`);
  },

  getInfoLogger: (moduleName: string) => {
    return Logger(`${name}:info:${moduleName}`);
  },

  getDebugLogger: (moduleName: string) => {
    return Logger(`${name}:debug:${moduleName}`);
  },
};

export = Factory;
