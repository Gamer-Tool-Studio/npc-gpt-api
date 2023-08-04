'use strict'
// eslint-disable-next-line arrow-body-style

const logError = console.log
const DB = require('src/database')

function countWords(str) {
  return str.trim().split(/\s+/).length
}

/**
 * From the input words, count words
 * - add entry to billing day input
 * - increase total billing input
 */
const inputBillingEvent = async function (inputData) {
  data = 'ola este e só para testar, vamos ver quantas palavras é que isto manja! '
  console.log('********* inputBillingEvent service **********', data)

  try {
    return { authToken: '0x13124124343' }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

/**
 * From the output words, count words
 * - add entry to billing day input
 * - increase total billing input
 */
const outputBillingEvent = async function (outputData) {
  data = 'ola este e só para testar, vamos ver quantas palavras é que isto manja!'

  console.log('********* ouputBilling service **********', data)

  try {
    return { authToken: '0x13124124343' }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

module.exports = { inputBillingEvent, outputBillingEvent }
