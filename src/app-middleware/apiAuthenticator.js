const { Router } = require('express');
const passport = require('passport');
const { getApiToken } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('apiAuthenticator');

// const challenges = require("$services/challenges");

/**
 * Routes that uses authentications
 */
const authRoutes = [
  '/api/v1/auth/getData',
  '/api/v1/user/profile',
  '/api/v1/auth/check',
  '/api/v1/usage/perDay',
  '/api/v1/auth/gen-key',
  '/api/v1/auth/edit-token',
  '/api/v1/auth/validate-token',
  '/api/v1/chat/send-message',
  '/api/v1/user/balance',
  '/api/v1/stripe/create',
  '/api/v1/user/balance',
];

const signValidatorHandler = async (req, res, next) => {
  logDebug(' API AUTHENTICATOR', `URL: ${req.originalUrl} METHOD: ${req.method}`);

  logDebug(' API HEADERS: ', req.headers);

  const { authorization } = req.headers;

  const calledUrl = req.originalUrl.split('?')[0];
  if (authRoutes.includes(calledUrl)) {
    try {
      logDebug('isAuthenticated ', req.isAuthenticated());

      const token = authorization.split('Bearer ')[1];
      // logDebug('token ', token);

      if (typeof token === 'string' && token.startsWith('GTS-')) {
        const jwt = await getApiToken(token);
        logDebug('jwt', jwt);
        req.headers.authorization = `Bearer ${jwt}`;
        logDebug('req.headers.authorization ', req.headers.authorization);
      }

      return passport.authenticate('jwt', { session: false })(req, res, next);
    } catch (error) {
      logError('Error in middleware ', error);
      return res.status(401).json({ message: 'not logged by middleware' });
    }
  } else {
    logDebug('Bypassing authorization for url: ', calledUrl);
    return next();
  }
};

module.exports = () => {
  return Router().use('/api', signValidatorHandler);
};
