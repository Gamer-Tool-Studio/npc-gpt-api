const jwt = require('jsonwebtoken');
const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('usage');
const { TOKEN_SECRET } = require('~/config');

/**
 * Issues a JWT for a user. Based on https://medium.com/swlh/everything-you-need-to-know-about-the-passport-jwt-passport-js-strategy-8b69f39014b0
 * @param {*} username username to issue JWT
 * @param {*} expiresIn expiring period
 * @param {*} payloadValues other props to be added
 */
exports.issueJWT = (username: string, payloadValues: any, expiresIn = '1800s') => {
  logDebug(`username is ${username}`);
  const payload = {
    sub: username,
    ...payloadValues,
  };

  const secret = TOKEN_SECRET;

  const signedToken = jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS512',
  });

  return {
    token: signedToken,
    expires: expiresIn,
  };
};
