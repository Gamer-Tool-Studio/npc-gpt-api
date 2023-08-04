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
  let wordsCount = countWords(
    inputData.message || 'ola este e só para testar, vamos ver quantas palavras é que isto manja! '
  )

  console.log('********* inputBillingEvent service **********', inputData)
  console.log('Total Words #', wordsCount)

  var today = new Date()
  const day = today.getDate()
  const month = today.getMonth() + 1
  const year = today.getFullYear()
  const key = day + month + year

  //increment billing log
  let updateBody = {
    $inc: { totalInputWords: wordsCount }
  }
  const options = { upsert: true }
  let result = await DB.createBillingLog({ accountId: inputData.accountId }, updateBody, options)

  // increment billing with day key
  let billingDayKey = await DB.findAndUpdateBillingDay(
    { key: key, accountId: inputData.accountId },
    { $inc: { inputWords: wordsCount } },
    options
  )

  try {
    return { data: result, inputWordsCount: wordsCount }
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
const outputBillingEvent = async function (inputData) {
  let wordsCount = countWords(
    inputData.message || 'ola este e só para testar, vamos ver quantas palavras é que isto manja! '
  )

  console.log('********* inputBillingEvent service **********', inputData)
  console.log('Total Words #', wordsCount)

  var today = new Date()
  const day = today.getDate()
  const month = today.getMonth() + 1
  const year = today.getFullYear()
  const key = day + month + year

  //increment billing log
  const options = { upsert: true }
  let billingLogOut = await DB.createBillingLog(
    { accountId: inputData.accountId },
    { $inc: { totalOutputWords: wordsCount } },
    options
  )

  // increment billing with day key
  let billingDayKey = await DB.findAndUpdateBillingDay(
    { key: key, accountId: inputData.accountId },
    { $inc: { outputWorks: wordsCount } },
    options
  )

  try {
    return { data: result, outputWordsCount: wordsCount }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

module.exports = { inputBillingEvent, outputBillingEvent }
