'use strict'
// eslint-disable-next-line arrow-body-style

const logError = console.log

/**
 * From the input words, count words
 * - add entry to billing day input
 * - increase total billing input
 */
const inputBillingEvent = async function (inputData) {
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
  console.log('********* ouputBilling service **********', data)

  try {
    return { authToken: '0x13124124343' }
  } catch (ex) {
    logError('Error validating data ', ex)
    throw ex
  }
}

module.exports = { inputBillingEvent, outputBillingEvent }
