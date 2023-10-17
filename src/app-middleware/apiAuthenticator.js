const { Router } = require('express');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('apiAuthenticator');

// const challenges = require("$services/challenges");

/**
 * Routes that uses authentications
 */
const authRoutes = ['/api/v1/auth/getData', '/api/v1/user/profile', '/api/v1/auth/check', '/api/v1/chat/send-message'];

const signValidatorHandler = (req, res, next) => {
  logDebug('API AUTHENTICATOR\n', 'URL : ', req.originalUrl, ' METHOD ', req.method);

  const calledUrl = req.originalUrl.split('?')[0];
  logDebug('called url ', calledUrl);
  if (authRoutes.includes(calledUrl)) {
    try {
      logDebug('isAuthenticated ', req.isAuthenticated());
      if (req.isAuthenticated()) {
        return next();
      }
      return res.status(401).json({ message: 'not logged by middleware' });
    } catch (error) {
      logError('Error in middlware ', error);
      const err = new Error('Internal server error');
      err.status = 500;
      return next(err);
    }
  } else {
    logDebug('Bypassing authorization for url: ', calledUrl);
    return next();
  }
};

module.exports = () => {
  return Router().use('/api', signValidatorHandler);
};
