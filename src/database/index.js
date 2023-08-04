const config = require('~/config')
const startMongo = require('./mongo')
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat')
const startRedis = require('./redis')

//load config of database url from individual strings
if (!config.databaseURL) {
  let url = 'mongodb+srv://'
  url += process.env.DB_USER + ':'
  url += process.env.DB_PASS + '@'
  url += process.env.DB_HOST + '/'
  // url += process.env.DB_PORT + '/';
  url += process.env.DB_NAME
  // url += '?authSource=admin';
  //url += '?replicaSet=' + process.env.REPL_SET;
  url += process.env.COMPLEMENT
  config.databaseURL = url
}

logDebug('MONGO URI CONNECTED :  ', config.databaseURL)
const Mongo = startMongo(config.databaseURL)

let Redis = {}
// let RedisSubscribe = {};
if (process.env.USE_REDIS === 'true') {
  console.log('Use REDIS try to connect : ', process.env.USE_REDIS)
  Redis = startRedis(config.redisUrl)
  // RedisSubscribe = startRedis(config.redisUrl)
}

const Database = {
  createAccount: (data, options) => {
    return Mongo.account.create(data, options)
  },
  createSession: (data, options) => {
    return Mongo.session.create(data, options)
  },
  findSession: (filter, select, options) => {
    return Mongo.session.find(filter, select, options)
  },

  findAccount: (filter, select, options) => {
    return Mongo.socialProof.find(filter, select, options)
  },

  findAndUpdateBillingDay: (query, data, options) => {
    return Mongo.billingDay.updateOne(query, data, options)
  },

  findAndUpdateBillingLog: (query, data, options) => {
    return Mongo.billing.updateOne(query, data, options)
  },

  findBillingDay: (filter, select, options) => {
    return Mongo.billingDay.find(filter, select, options)
  },

  findBillingLog: (filter, select, options) => {
    return Mongo.billing.find(filter, select, options)
  },

  findUsers: (filter, select, options) => {
    console.log('BD Filter users ', filter)
    return Mongo.user.find(filter, select, options)
  },

  findSignDocument: async (filter, select, options) => {
    return await Mongo.signDocument.find(filter, select, options)
  },
  findQesBilling: async (filter, select, options) => {
    return await Mongo.qes_billing.find(filter, select, options)
  },
  findEnvironment: async (filter, select, options) => {
    return await Mongo.environment.find(filter, select, options)
  },
  findCompanyProfile: async (filter, select, options) => {
    return await Mongo.company.find(filter, select, options)
  },
  updateCompanyProfile: async (criteria, update, options) => {
    return await Mongo.company.findOneAndUpdate(criteria, update, options)
  },

  saveToken: async (key, token, ttl) => {
    let sTtl = ttl || config.REDIS_AUTH_TTL

    let res = await Redis.SETEX(key, sTtl, token)
    console.log('result after saved redis key ', res)
  },

  getToken: async (key) => {
    console.log('[DATA_REDIS] will get token...')
    let token = await Redis.get(key)
    console.log('[DATA_REDIS] returned token ', token)
    return token
  },

  initKYCData: async (key, idt, reference) => {
    let res = await Redis.hset(key, 'ref', reference, 'idt', idt, 'status', 'request.pending')
    let ex = await Redis.expire(key, 1200) //expire after 20 minutes

    logDebug('[DATA_REDIS] initKYCData result ', res, ' expire ', ex)
  },

  updateKYCData: async (key, field, data) => {
    let res = await Redis.hset(key, field, data)

    logDebug('[DATA_REDIS] updateKYCData result ', res)
  },

  getKYCData: async (key, param) => {
    let result

    if (!param) result = await Redis.hgetall(key)
    else result = await Redis.hget(key, param)

    logDebug('[DATA_REDIS] getKYCData result ', result)

    return result
  }
}

module.exports = Database
