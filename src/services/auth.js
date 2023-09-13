const DB = require('src/database');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('auth-service');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// const ADMIN_TOKEN = 'bWFzdGVydmlhbmE6YmVuZmljYSNkaW1hcmlh';

function generateKey(size = 32, format = 'base64') {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

const registerUser = async (data) => {
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

const authLogin = async (data) => {
  logDebug('********* authenticator route **********', data);

  const token = generateKey(12);
  const newBody = {
    accountId: data.accountId,
    sessionId: token,
  };
  const createdSession = await DB.createSession(newBody);
  logDebug('created session id ', createdSession);

  try {
    return { authToken: token };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

const createAccount = async (data) => {
  logDebug('********* create account route **********', data);

  if (!data.email) {
    throw new Error('Should supply email account');
  }

  try {
    const newAccount = {
      email: data.email,
      apiKey: generateKey(),
      apiSecret: generateKey(64),
    };

    const newAccountCreated = await DB.createAccount(newAccount);

    return { newAccountCreated };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

const listAccount = async (data) => {
  logDebug('********* listAccount route **********', data);

  try {
    const account = { authToken: '0x13124124343' };
    return account;
    // eslint-disable-next-line no-unreachable
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

const resetApiKey = async (data) => {
  logDebug('********* authenticator route **********', data);

  try {
    return { authToken: '0x13124124343' };
    // eslint-disable-next-line no-unreachable
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

module.exports = {
  authLogin,
  resetApiKey,
  createAccount,
  listAccount,
  registerUser,
};
