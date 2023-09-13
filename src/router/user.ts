import { Router, Request, Response } from 'express';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

/**
 *  User profile
 */
router.get('/profile', (req: Request, res: Response) => {
  logDebug('Route /profile');
  try {
    res.json({ message: 'its okay', user: req.user });
  } catch (error) {
    logError(error);
  }
});

export default router;
