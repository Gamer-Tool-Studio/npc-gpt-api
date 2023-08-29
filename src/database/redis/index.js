const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('redis');
const redis = require('async-redis');

module.exports = (redisUrl) => {
  const redisClient = redis.createClient(redisUrl);

  redisClient.on('connect', () => logDebug('REDIS connection established ', redisUrl));

  redisClient.on('end', () => logDebug('REDIS connection closed'));

  redisClient.on('error', (err) => logDebug('REDIS connection error ', err.message));

  return redisClient;
};
