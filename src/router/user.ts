import { Router, Request, Response } from 'express';
import { filterObject } from 'src/lib/util';

const DB = require('src/database');
const { mapGoogleToProfile } = require('src/lib/util');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

interface KeysInfo {
  name: string;
  key: string;
  created: Date;
  used: string;
}

/**
 *  User profile
 */
router.get('/profile', async (req: Request, res: Response) => {
  logDebug('Route /profile', req.user);
  let mappedUser;

  const { strategy } = req.user as unknown as { strategy: string };
  logDebug('strategy', strategy);

  const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
  try {
    switch (strategy) {
      case 'google':
        mappedUser = mapGoogleToProfile(req.user);

        break;
      case 'local':
      case 'jwt': {
        const filter = ['id', 'username', 'email', 'tokens'];
        const userFiltered = filterObject(user.toJSON() as unknown as Record<string, unknown>, filter);
        mappedUser = { ...userFiltered };

        const tokens = mappedUser.tokens as string[];
        mappedUser.keys = tokens.map((token: string) => ({
          name: token,
          key: token.slice(0, 7),
          created: new Date(),
          used: 'Never',
        })) as [KeysInfo];
        delete mappedUser.tokens;

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
