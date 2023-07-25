module.exports = [
  require('./bodyParserJsonFactory'),
  require('./bodyParserUrlEncodeFactory'),
  // require('./apiAuthenticator'),
  // require('./verifyOperationBalance'),
  require('./requestCalls'),
  require('./swaggerFactory'),
  require('./corsFactory'),
  require('./sessionFactory'),

  // Routes should immediately precede Error Handlers

  require('./staticFilesFactory'),
  require('./routesFactory'),

  require('./unmatchedRouteHandlerFactory'),

  // Make sure configureErrorHandler is LAST!!!
  require('./errorHandlerFactory')
]
