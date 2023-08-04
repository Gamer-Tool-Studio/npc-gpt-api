const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const MongoModels = {}

function loadModels() {
  var path_ = path.resolve('./src/database/mongo/schemas')
  logDebug('Path : ', path_)

  // let schema = require(path.resolve(path_, 'ca'))
  // MongoModels['ca'] = mongoose.model('ca', schema)

  console.log('OLA ', path.resolve('./schemas/account'))

  let account = './schemas/account'
  let billing = './schemas/billing'
  let billingDay = './schemas/billingDay'

  MongoModels['account'] = mongoose.model('account', require(`${account}`))
  MongoModels['billing'] = mongoose.model('billing', require(`${billing}`))
  MongoModels['billingDay'] = mongoose.model('billingDay', require(`${billingDay}`))
}

module.exports = function (url) {
  try {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
      //useCreateIndex: false,
      connectTimeoutMS: 10000,
      retryWrites: false
    })

    mongoose.connection.on('connected', () => logDebug('Connection to database established'))
    loadModels()
    return MongoModels
  } catch (error) {
    logDebug('[DATABASE] ', error)
  }
}
