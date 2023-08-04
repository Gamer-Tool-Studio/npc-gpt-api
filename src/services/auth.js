'use strict'
// eslint-disable-next-line arrow-body-style

const DB = require('src/database')
const logError = console.log
const ADMIN_TOKEN = 'bWFzdGVydmlhbmE6YmVuZmljYSNkaW1hcmlh'
const crypto = require('crypto')

function generateKey(size = 32, format = 'base64') {
  const buffer = crypto.randomBytes(size)
  return buffer.toString(format)
}

const authLogin = async function (data) {
  console.log('********* authenticator route **********', data)

  try {
    return { authToken: '0x13124124343' }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

const createAccount = async function (data) {
  console.log('********* create account route **********', data)

  if (!data.email) {
    throw 'Should supply email account'
  }

  try {
    let newAccount = {
      email: data.email,
      apiKey: generateKey(),
      apiSecret: generateKey(64)
    }

    let newAccountCreated = await DB.createAccount(newAccount)

    return { newAccountCreated }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

const listAccount = async function (data) {
  console.log('********* listAccount route **********', data)

  try {
    let account = {}
    return { authToken: '0x13124124343' }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

const resetApiKey = async function (data) {
  console.log('********* authenticator route **********', data)

  try {
    return { authToken: '0x13124124343' }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

module.exports = { authLogin, resetApiKey, createAccount }
