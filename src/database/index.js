const config = require('~/config');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('database');
const startMongo = require('./mongo');
// const startRedis = require('./redis');

// load config of database url from individual strings
if (!config.databaseURL) {
  let url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/`;
  // url += process.env.DB_PORT + '/';
  url += process.env.DB_NAME;
  // url += '?authSource=admin';
  // url += '?replicaSet=' + process.env.REPL_SET;
  url += process.env.COMPLEMENT;
  config.databaseURL = url;
}

logDebug('MONGO URI CONNECTED :  ', config.databaseURL);
const mongoDB = startMongo(config.databaseURL);

if (!mongoDB) {
  logError('[DATABASE] ');
}

let Redis = {};
// let RedisSubscribe = {};
// if (process.env.USE_REDIS === 'true') {
//   logDebug('Use REDIS try to connect : ', process.env.USE_REDIS);
//   Redis = startRedis(config.redisUrl);
//   // RedisSubscribe = startRedis(config.redisUrl)
// }

const Database = {
  createTokenMap: (data, options) => {
    return mongoDB.token.create(data, options);
  },
  findToken: (filter, select, options) => {
    return mongoDB.token.findOne(filter, select, options);
  },
  createAccount: (data, options) => {
    return mongoDB.account.create(data, options);
  },
  createSession: (data, options) => {
    return mongoDB.session.create(data, options);
  },
  findSession: (filter, select, options) => {
    return mongoDB.session.find(filter, select, options);
  },

  findAccount: (filter, select, options) => {
    return mongoDB.socialProof.find(filter, select, options);
  },

  findUser: (filter, select, options) => {
    return mongoDB.user.find(filter, select, options);
  },
  findSingleUser: (filter, select, options) => {
    return mongoDB.user.findOne(filter, select, options);
  },
  findUserAndUpdate: (filter, update, options) => {
    return mongoDB.user.findOneAndUpdate(filter, update, options);
  },
  UpdateOneUser: (filter, update, options) => {
    return mongoDB.user.updateOne(filter, update, options);
  },
  findUserById: (id) => {
    return mongoDB.user.findById(id);
  },
  registerUser: (data, options) => {
    return mongoDB.user.create(data, options);
  },

  findAndUpdateBillingDay: (query, data, options) => {
    return mongoDB.billingDay.updateOne(query, data, options);
  },

  findAndUpdateBillingLog: (query, data, options) => {
    return mongoDB.billing.updateOne(query, data, options);
  },

  findBillingDayUpdate: (filter, select, options) => {
    return mongoDB.billingDay.findOneAndUpdate(filter, select, options);
  },
  findBillingDay: (filter, select, options) => {
    return mongoDB.billingDay.find(filter, select, options);
  },
  findBillingDayAggregate: async (year, month, accountId) => {
    try {
      const result = await mongoDB.billingDay.aggregate([
        {
          $match: {
            accountId,
          },
        },
        {
          $unwind: '$dailyValues',
        },
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $year: '$dailyValues.date' }, year] },
                { $eq: [{ $month: '$dailyValues.date' }, month] },
              ],
            },
          },
        },
        {
          $group: {
            _id: '$accountId',
            data: {
              $push: {
                input: '$dailyValues.inputWords',
                output: '$dailyValues.outputWords',
                date: '$dailyValues.date',
              },
            },
            // totalInput: { $push: '$dailyValues.inputWords' },
            // totalOutput: { $push: '$dailyValues.inputWords' },
          },
        },
      ]);
      console.error('aggregate data:', result[0]?.data);

      if (result.length > 0) {
        const monthlyData = result[0].data;
        const numberOfDaysInMonth = new Date(year, month, 0).getDate(); // Calculate the number of days in the specified month

        // Create arrays with zeros for all days in the month
        const input = Array(numberOfDaysInMonth).fill(0);
        const output = Array(numberOfDaysInMonth).fill(0);

        // Fill in the actual data where it exists
        monthlyData.forEach((entry) => {
          const dayOfMonth = new Date(entry.date).getDate();

          input[dayOfMonth - 1] += entry.input;
          output[dayOfMonth - 1] += entry.output;
        });

        return { input, output }; // Total value for the specified year and month
      }
      return 0; // No data found for the specified year and month
    } catch (err) {
      console.error('Error retrieving data:', err);
      throw err;
    }
  },

  findBillingLog: (filter, select, options) => {
    return mongoDB.billing.findOne(filter, select, options);
  },

  findUsers: (filter, select, options) => {
    logDebug('BD Filter users ', filter);
    return mongoDB.user.find(filter, select, options);
  },

  findSignDocument: (filter, select, options) => {
    return mongoDB.signDocument.find(filter, select, options);
  },
  findQesBilling: (filter, select, options) => {
    return mongoDB.qes_billing.find(filter, select, options);
  },
  findEnvironment: (filter, select, options) => {
    return mongoDB.environment.find(filter, select, options);
  },
  findCompanyProfile: (filter, select, options) => {
    return mongoDB.company.find(filter, select, options);
  },

  saveToken: async (key, token, ttl) => {
    const sTtl = ttl || config.REDIS_AUTH_TTL;

    const res = await Redis.SETEX(key, sTtl, token);
    logDebug('result after saved redis key ', res);
  },

  getToken: async (key) => {
    logDebug('[DATA_REDIS] will get token...');
    const token = await Redis.get(key);
    logDebug('[DATA_REDIS] returned token ', token);
    return token;
  },

  initKYCData: async (key, idt, reference) => {
    const res = await Redis.hset(key, 'ref', reference, 'idt', idt, 'status', 'request.pending');
    const ex = await Redis.expire(key, 1200); // expire after 20 minutes

    logDebug('[DATA_REDIS] initKYCData result ', res, ' expire ', ex);
  },

  updateKYCData: async (key, field, data) => {
    const res = await Redis.hset(key, field, data);

    logDebug('[DATA_REDIS] updateKYCData result ', res);
  },

  getKYCData: async (key, param) => {
    let result;

    if (!param) result = await Redis.hgetall(key);
    else result = await Redis.hget(key, param);

    logDebug('[DATA_REDIS] getKYCData result ', result);

    return result;
  },
};

module.exports = Database;
