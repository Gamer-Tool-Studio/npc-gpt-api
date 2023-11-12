import { NextFunction, Request, Response } from 'express';
import { verifyJWT } from 'src/lib/jwt';

const DB = require('src/database');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:auth');
const { issueJWT } = require('src/lib/jwt');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generateKey(size = 32, format = 'base64') {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

/**
 * Given a passport session with will create both user and account
 * @param {*} data
 * @returns
 */
export const createNewUserAndAccount = async (user: any) => {
  logDebug('********* createNewUserAndAccount **********');

  try {
    // if (user.type == 'google') {
    const savedUser = await DB.findSingleUser({ ext_id: user.id });
    // if user does not exist, create user and account data
    if (!savedUser) {
      const newUser = {
        ext_id: user.id,
        email: user.emails[0] || '',
        username: user.displayNam || user.username,
        type: user.type,
        photos: user.photos || '',
      };
      const createdUser = await DB.registerUser(newUser);
      return createdUser;
    }
    throw new Error('User already exists');
    // }
  } catch (ex) {
    logError('createNewUserAndAccount  ', ex);
    throw ex;
  }
};

export const registerUser = async (data: any) => {
  logDebug('********* authenticator route **********', data);

  const passwordHash = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10), null);
  const newUser = await DB.registerUser({ ...data, password: passwordHash });
  logDebug('Created user', newUser);

  try {
    return newUser;
  } catch (ex) {
    logError('register new user ', ex);
    throw ex;
  }
};

export const listAccount = async () => {
  logDebug('********* listAccount route **********');

  try {
    const account = { authToken: '0x13124124343' };
    return account;
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

export const resetApiKey = async () => {
  logDebug('********* authenticator route **********');

  try {
    return { authToken: '0x13124124343' };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};
export const registerApiToken = async (accountId: string | undefined, token: string, jwt: JsonWebKey) => {
  logDebug('********* registerApiToken method **********', accountId);
  try {
    const newTokenMap = await DB.createTokenMap({ token, jwt });
    const updatedUser = await DB.findUserAndUpdate({ _id: accountId }, { $push: { tokens: token } }, { upsert: true });

    return { newTokenMap, updatedUser };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};
export const issueApiToken = async () => {
  logDebug('********* issueApiKey method **********');
  try {
    const token = `GTS-${generateKey(32)}`;
    logDebug('token', token);

    return { token };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

export async function verifyApiToken(req: Request, res: Response, next: NextFunction) {
  logDebug('********* verifyApiToken method **********', req.user);
  try {
    // if (req.isAuthenticated()) {
    //   return next();
    // }

    const token = req.headers.authorization?.split('Bearer ')?.[1];
    logDebug('token', token);
    if (token) {
      const { jwt } = await DB.findToken({ token });
      logDebug('jwt', jwt);

      const verify = await verifyJWT(jwt);
      logDebug('verify', verify);
      if (!verify) {
        res.status(401).json('Unauthorized');
      }

      return next();
    }
    return res.status(401).send('Unauthorized');

    // eslint-disable-next-line no-unreachable
  } catch (ex) {
    logError('Error verifyApiToken ', ex);
    throw ex;
  }
}

export const issueTokenForUser = async (userDetails: any) => {
  // Issues token
  return issueJWT(
    // eslint-disable-next-line no-underscore-dangle
    userDetails.id,
    userDetails,
    '24h',
  );
};
