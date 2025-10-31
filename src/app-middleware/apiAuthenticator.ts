import {
  Response, Request, NextFunction, Router,
} from 'express';

import passport from 'passport';
import { getApiToken } from 'src/services/auth';

const { ErrorType: { UNAUTHORIZED }, errors } = require('src/constants');

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
  '/api/v1/user/organization/members',
  '/api/v1/user/organization/name',
  '/api/v1/user/usage-stats',
  '/api/v1/user/update-profile',
  '/api/v1/user/update-picture',
];

const signValidatorHandler = async (req: Request, res: Response, next: NextFunction) => {
  logDebug(' API AUTHENTICATOR', `URL: ${req.originalUrl} METHOD: ${req.method}`);

  const { authorization } = req.headers;

  const calledUrl = req.originalUrl.split('?')[0];
  
  // Check if route requires authentication (exact match or pattern match for parameterized routes)
  const requiresAuth = authRoutes.includes(calledUrl) || 
    calledUrl.match(/^\/api\/v1\/user\/organization\/members\/[^\/]+\/role$/) ||
    calledUrl.match(/^\/api\/v1\/user\/organization\/members\/[^\/]+$/);
  
  if (requiresAuth) {
    try {
      if (!authorization) {
        return res.status(errors[UNAUTHORIZED].status).json(errors[UNAUTHORIZED].msg);
      }
      const token = authorization.split('Bearer ')[1];

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

export = () => {
  return Router().use('/api', signValidatorHandler);
};
