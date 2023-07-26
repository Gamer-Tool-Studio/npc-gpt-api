const Logger = require('debug');

const Factory = {
  getLogger: (name: string) => {
    return {
      logError: Logger(`secret-gpt:error:${name}`),
      logDebug: Logger(`secret-gpt:${name}`),
    };
  },

  getErrorLogger: (name: string) => {
    return Logger(`secret-gpt:error:${name}`);
  },

  getWarnLogger: (name: string) => {
    return Logger(`secret-gpt:warn:${name}`);
  },

  getInfoLogger: (name: string) => {
    return Logger(`secret-gpt:info:${name}`);
  },

  getDebugLogger: (name: string) => {
    return Logger(`secret-gpt:debug:${name}`);
  },
};

export = Factory;
