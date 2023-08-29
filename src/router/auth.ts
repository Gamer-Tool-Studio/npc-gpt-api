import { Router, Request, Response } from 'express';

const { authLogin, createAccount } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat');

const router = Router();

router.post('/gen-auth', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Auth token route **** ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    res.json({
      token: res.locals.authToken,
      username: res.locals.username,
    });
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    logDebug(' **** login **** ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    const authToken = await authLogin();

    res.status(200).json({
      token: authToken,
    });
  } catch (ex) {
    logError('login error ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post('/reset-secret', async (req: Request, res: Response) => {
  try {
    logDebug(' **** reset-secret **** route ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    res.status(200).json({
      token: res.locals.authToken,
      username: res.locals.username,
    });
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post('/create-account', async (req: Request, res: Response) => {
  try {
    logDebug(' **** reset-secret **** route ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    const a = await createAccount(req.body);
    res.status(200).json({ newAccount: a });
  } catch (ex) {
    logError('create-account log error ', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
