import { Router, Request, Response } from 'express';
import parameterValidator from 'src/core-services/parameterValidator';
import passport from 'passport';
import { filterObject } from 'src/lib/util';
import { getApiToken, issueApiToken, issueTokenForUser, registerApiToken } from 'src/services/auth';
import { issueJWT, verifyJWT } from 'src/lib/jwt';

const DB = require('src/database');
const { createAccount, registerUser } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:auth');
const { ALLOW_REGISTER } = require('~/config');

const router = Router();

router.get('/check', async (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({ error: 'Not registered' });
  }

  const filter = ['id', 'username', 'email'];
  const userFiltered = filterObject(user as unknown as Record<string, unknown>, filter);
  logDebug(' ****user **** after', userFiltered);

  const tokenObject = await issueTokenForUser(userFiltered);

  return res.status(200).json({
    token: tokenObject.token,
    expiresIn: tokenObject.expires,
    isAuthenticated: true,
  });
});

router.post('/validate-token', async (req: Request, res: Response) => {
  try {
    logDebug(' **** validate-token route **** ');

    const { token } = req.body;
    logDebug(' **** token **** ', token);

    if (token) {
      const jwt = await getApiToken(String(token));
      if (!jwt) {
        res.status(401).json('Unauthorized');
      }
      logDebug(' **** jwt **** ', jwt);

      res.status(200).end();
    } else {
      res.status(401).json('Unauthorized');
    }
  } catch (ex) {
    logError('/validate-token', ex);
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
  if (!ALLOW_REGISTER) return res.status(403).json({ error: 'Register currently disabled' });
  try {
    logDebug(' **** register route **** ');
    const params = ['username', 'password', 'email'];
    parameterValidator(req.body, params);

    const newUser = await registerUser(req.body);
    return res.json({ user: newUser });
  } catch (ex) {
    logError('issue register new user ', ex);
    return res.status(500).json({ error: ex });
  }
});

// TODO: refactor
router.post('/local/login', async (req: Request, res: Response) => {
  logDebug(' **** login route **** ', req.user);
  try {
    const { username, password } = req.body;
    const user = await DB.findSingleUser({ username }, null, null);

    if (!user) {
      res.status(403).json({ error: 'login user error', user: 'User not found' });
    }

    if (!user.verifyPassword(password)) {
      res.status(403).json({ error: 'login password error', msg: 'WRONG_PASSWORD' });
    }

    const filter = ['id', 'username', 'email'];
    const userFiltered = filterObject(user.toJSON() as unknown as Record<string, unknown>, filter);
    logDebug(' ****user **** after', userFiltered);

    const tokenObject = await issueTokenForUser(userFiltered);

    return res.status(200).json({
      success: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
    });
  } catch (err) {
    logDebug(err);
    return res.status(500).json({ error: 'Error in login' });
  }
});

router.get('/gen-key', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Auth token route **** ');
    const { user } = req;
    const { name = 'Default Name' } = req.query as unknown as { name: string };
    logDebug(' ****name ****', name);

    const filter = ['id', 'username', 'email'];
    const userFiltered = filterObject(user as unknown as Record<string, unknown>, filter);
    logDebug(' ****user **** after', userFiltered);

    const { token } = await issueApiToken();

    const jwtPayload = {
      id: userFiltered.id,
      token,
    };
    const { token: jwt } = await issueJWT(userFiltered.id as string, jwtPayload, '999years');
    logDebug('jwt', jwt);

    // TODO: store api key on user db and keys db to use on mapping

    const result = await registerApiToken(user?.id, token, jwt, name);
    logDebug('result', result);

    const verify = await verifyJWT(jwt);
    logDebug('verify', verify);
    if (!verify) {
      res.status(401).json('Unauthorized');
    }

    res.json({
      token,
      jwt,
      name,
    });
  } catch (ex) {
    logError('/gen-key ', ex);
    res.status(500).json({ error: ex });
  }
});

router.patch('/edit-token', async (req: Request, res: Response) => {
  try {
    logDebug(' **** req.query **** ', req.query);
    const userId = req.user?.id;
    const { id: tokenId, name } = req.query;

    const user = await DB.UpdateOneUser(
      { _id: userId, 'tokens.id': tokenId },
      {
        $set: {
          'tokens.$.name': name, // Update other fields as needed
        },
      },
    );
    logDebug(' ****user**** ', user);

    res.status(200).send('Token updated');
  } catch (ex) {
    logError('edit-token ', ex);
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
