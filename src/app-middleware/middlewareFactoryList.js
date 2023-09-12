/* eslint-disable global-require */
module.exports = [
  require('./bodyParserJsonFactory'),
  require('./bodyParserUrlEncodeFactory'),
  // require('./apiAuthenticator'),
  // require('./verifyOperationBalance'),
  require('./requestCalls'),
  require('./swaggerFactory'),
  require('./corsFactory'),

  //session and passportJS
  require('./sessionFactory'),
  //require('./express-session'),
  require('./passport'),

  // Routes should immediately precede Error Handlers
  require('./staticFilesFactory'),
  require('./apiAuthenticator'),
  require('./routesFactory'),

  require('./unmatchedRouteHandlerFactory'),

  // Make sure configureErrorHandler is LAST!!!
  require('./errorHandlerFactory'),
];
