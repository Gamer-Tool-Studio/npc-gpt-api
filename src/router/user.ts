import { Router, Request, Response } from 'express';

const { mapGoogleToProfile } = require('src/lib/util');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

/**
 *  User profile
 */
router.get('/profile', (req: Request, res: Response) => {
  logDebug('Route /profile', req.user);
  let mappedUser;

  const { strategy } = req.user as unknown as { strategy: string };
  logDebug('strategy', strategy);

  try {
    switch (strategy) {
      case 'google':
        mappedUser = mapGoogleToProfile(req.user);

        break;
      case 'local':
        break;

      default:
        break;
    }
    res.json({ message: 'its okay', user: mappedUser });
  } catch (error) {
    logError(error);
  }
});

export default router;
