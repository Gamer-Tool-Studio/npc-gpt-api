const { Router } = require('express');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('requestCalls');

// const challenges = require("$services/challenges");

/**
 * Routes that uses authentications
 */
const authRoutes = ['/api/v1/auth/gen-auth'];

const signValidatorHandler = async function (req, response, next) {
  logDebug('API AUTHENTICATOR\n', 'URL : ', req.originalUrl, ' METHOD ', req.method);

  const calledUrl = req.originalUrl.split('?')[0];
  logDebug('called url ', calledUrl);

  if (authRoutes.includes(calledUrl)) {
    try {
      const authToken = req.header('Authorization') || null;
      logDebug('AuthToken in header: ', authToken);

      if (!authToken) {
        logDebug("Missing authorization token in header 'Authorization' ");
        const err = new Error('Unauthorized');
        err.status = 401;
        next(err);
      } else {
        logDebug('check if token is valid and billing its OK : AUTH_ ', authToken);
        response.locals = {
          username: 'userA',
          authToken,
        };
        next();
      }
    } catch (error) {
      logError('Error in middlware ', error);
      const err = new Error('Internal server error');
      err.status = 500;
      next(err);
    }
  } else {
    logDebug('Bypassing authorization for url: ', calledUrl);
    next();
  }
};

module.exports = () => {
  return Router().use('/api', signValidatorHandler);
};
