import { Router, Request, Response } from 'express';
import { checkAuthenticated, filterObject } from 'src/lib/util';

const { mapGoogleToProfile } = require('src/lib/util');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

/**
 *  User profile
 */
router.get('/profile', checkAuthenticated, (req: Request, res: Response) => {
  logDebug('Route /profile', req.user);
  let mappedUser;

  const { strategy } = req.user as unknown as { strategy: string };
  logDebug('strategy', strategy);

  try {
    switch (strategy) {
      case 'google':
        mappedUser = mapGoogleToProfile(req.user);

        break;
      case 'local': {
        const filter = ['id', 'username', 'email'];
        const userFiltered = filterObject(req.user as unknown as Record<string, unknown>, filter);
        logDebug(' ****user **** after', userFiltered);
        mappedUser = { ...userFiltered };

        break;
      }

      default:
        break;
    }
    res.json({ ...mappedUser });
  } catch (error) {
    logError(error);
  }
});

export default router;
