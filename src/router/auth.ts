import { Router, Request, Response } from 'express';
import parameterValidator from 'src/core-services/parameterValidator';
import passport from 'passport';
import { filterObject } from 'src/lib/util';

const { createAccount, registerUser } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('auth');

const router = Router();

router.get('/check', (req, res) => {
  res.status(200).json({
    isAuthenticated: true,
    token: 'token',
    user: req.user,
  });
});

router.get('/getData', async (req: Request, res: Response) => {
  try {
    logDebug(' **** getData route **** ');
    res.json({
      token: req.user,
    });
  } catch (ex) {
    logError('/getData', ex);
    res.status(500).json({ error: ex });
  }
});

/**
 *
 *  Google authenticator
 * */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://127.0.0.1.:3000/redirect');
});

router.get('/google/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 *
 *  Local authenticator
 * */

router.post('/local/register', async (req: Request, res: Response) => {
  try {
    logDebug(' **** register route **** ');
    const params = ['username', 'password', 'email'];
    parameterValidator(req.body, params);

    const newUser = await registerUser(req.body);
    res.json({ user: newUser });
  } catch (ex) {
    logError('issue register new user ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post('/local/login', passport.authenticate('local'), async (req: Request, res: Response) => {
  logDebug(' **** login route **** ', req.user);

  const { user } = req;

  if (!user) {
    return res.status(401).json({ error: 'Not registered' });
  }

  const filter = ['_id', 'username', 'email'];
  const userFiltered = filterObject(user as unknown as Record<string, unknown>, filter);
  logDebug(' ****user **** after', userFiltered);

  return res.json({ user: userFiltered });
});

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

// router.post('/login', async (req: Request, res: Response) => {
//   try {
//     logDebug(' **** login **** ');

//     logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

//     const authToken = await authLogin();

//     res.status(200).json({
//       token: authToken,
//     });
//   } catch (ex) {
//     logError('login error ', ex);
//     res.status(500).json({ error: ex });
//   }
// });

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
