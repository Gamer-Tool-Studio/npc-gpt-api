const Logger = require('debug')
const Factory = {
  getLogger: (name) => {
    return {
      logError: Logger(`secret-gpt:error:${name}`),
      logDebug: Logger(`secret-gpt:${name}`)
    }
  },

  getErrorLogger: (name) => {
    return Logger(`secret-gpt:error:${name}`)
  },

  getWarnLogger: (name) => {
    return Logger(`secret-gpt:warn:${name}`)
  },

  getInfoLogger: (name) => {
    return Logger(`secret-gpt:info:${name}`)
  },

  getDebugLogger: (name) => {
    return Logger(`secret-gpt:debug:${name}`)
  }
}

module.exports = Factory
