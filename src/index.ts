const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('app')

import express from 'express'

import middlewareFactory from './app-middleware/middlewareFactory'

import config from './config'

logDebug('app')

const app = express()
app.use(middlewareFactory(config))
const port = parseInt(config.desiredPort, 10)

app.listen(port, () => {
  logDebug(`Server is running on port ${port}`)
})
