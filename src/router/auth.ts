import { Router, Request, Response } from 'express';
import parameterValidator from 'src/core-services/parameterValidator';
import passport from 'passport';
import { filterObject } from 'src/lib/util';
import { issueApiToken, issueTokenForUser, registerApiToken } from 'src/services/auth';
import { issueJWT, verifyJWT } from 'src/lib/jwt';
import { Types } from 'mongoose';
import DB from 'src/database';
import config from 'src/config';
import { DataBaseSchemas } from 'src/types/enums';

const { ALLOW_REGISTER, FRONTEND_URL } = config;

const { ObjectId } = Types;

const { registerUser } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:auth');

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
    logDebug(' **** validate-token route **** ', req.user);
    const user = await DB.findOne(DataBaseSchemas.BILLING, { accountId: new ObjectId(req.user?.id) }, null, null);
    logDebug(' **** user **** ', user);

    res.status(200).json(user).end();
  } catch (ex) {
    logError('/validate-token', ex);
    res.status(500).json({ error: ex });
  }
});

/**
 *
 *  Hello.coop SSO authenticator
 * */
router.post('/hello/callback', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Hello.coop callback route **** ', req.body);
    
    const { code, id_token } = req.body;
    
    if (!code && !id_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=Authentication failed`);
    }
    
    // TODO: Verify the id_token with Hello.coop
    // For now, we'll decode it (in production, verify the signature)
    const payload = id_token ? JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString()) : null;
    
    if (!payload || !payload.email) {
      return res.redirect(`${FRONTEND_URL}/login?error=Invalid token`);
    }
    
    const { sub, email, name, picture } = payload;
    
    // Check if user exists
    let user = await DB.findSingleUser({ email });
    
    // If user doesn't exist, create new user
    if (!user) {
      const username = email.split('@')[0];
      const newUserData = {
        username,
        email,
        name: name || username,
        picture,
        authProvider: 'hellocoop',
        sub,
        password: Math.random().toString(36).slice(-12), // Random password for Hello.coop users
      };
      
      user = await registerUser(newUserData);
      logDebug(' **** New user created via Hello.coop **** ', user);
    }
    
    const filter = ['id', 'username', 'email'];
    const userFiltered = filterObject(user.toJSON() as unknown as Record<string, unknown>, filter);
    
    const tokenObject = await issueTokenForUser(userFiltered);
    
    // Redirect back to frontend with token
    return res.redirect(`${FRONTEND_URL}/auth/hello/callback?token=${tokenObject.token}`);
  } catch (error: any) {
    logError('Hello.coop callback error', error);
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error?.message || 'Authentication failed')}`);
  }
});

/**
 *
 *  Google authenticator (Legacy - to be removed)
 * */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect(`${FRONTEND_URL}/redirect`);
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

    // Use unified user initialization
    const { initializeUser } = require('src/services/user-initialization');
    const newUser = await initializeUser(req.body, 'local');
    
    const filter = ['id', 'username', 'email', 'name'];
    const userFiltered = filterObject(newUser.toJSON() as unknown as Record<string, unknown>, filter);
    
    const tokenObject = await issueTokenForUser(userFiltered);
    
    return res.json({ 
      success: true,
      user: userFiltered,
      token: tokenObject.token 
    });
  } catch (error: any) {
    logError('issue register new user ', error);
    return res.status(500).send({ error: error?.message });
  }
});

// TODO: refactor
router.post('/local/login', async (req: Request, res: Response) => {
  logDebug(' **** login route **** ', req.user);
  try {
    const { username, password } = req.body;

    const user = await DB.findSingleUser({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

    if (!user) {
      return res.status(403).json({ error: 'login user error', user: 'User not found' });
    }

    if (!user.verifyPassword(password)) {
      return res.status(403).json({ error: 'Wrong username or password' });
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

export default router;
