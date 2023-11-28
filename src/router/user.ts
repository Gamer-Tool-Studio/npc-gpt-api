import { Router, Request, Response } from 'express';
import { filterObject } from 'src/lib/util';
import { TokenEntry } from 'src/types/auth';

const DB = require('src/database');
const { mapGoogleToProfile } = require('src/lib/util');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

/**
 *  User profile
 */
router.get('/profile', async (req: Request, res: Response) => {
  logDebug('Route /profile', req.user);
  let mappedUser;

  const { strategy } = req.user as unknown as { strategy: string };
  logDebug('strategy', strategy);

  const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
  logDebug('db user', user);

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

        const tokens = mappedUser.tokens as TokenEntry[];
        // eslint-disable-next-line object-curly-newline
        mappedUser.keys = tokens.map(({ id, name, lastUsed, dateCreated, token }: TokenEntry) => ({
          id,
          name,
          key: `${token.slice(0, 12)}...`,
          dateCreated,
          lastUsed: lastUsed || 'Not used',
        }));
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
