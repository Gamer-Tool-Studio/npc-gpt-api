const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat')
const redis = require('async-redis')

module.exports = function (redisUrl) {
  let redisClient = redis.createClient(redisUrl)

  redisClient.on('connect', () => logDebug('REDIS connection established ', redisUrl))

  redisClient.on('end', () => logDebug('REDIS connection closed'))

  redisClient.on('error', (err) => logDebug('REDIS connection error ', err.message))

  return redisClient
}
