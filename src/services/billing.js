// eslint-disable-next-line arrow-body-style

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('billing-service');
const { encode } = require('gpt-3-encoder');
const DB = require('src/database');

function countWords(str) {
  // return str.trim().split(/\s+/).length;
  return encode(str).length;
}

const options = { upsert: true, new: true };

/**
 * From the input words, count words
 * - add entry to billing day input
 * - increase total billing input
 */
const inputBillingEvent = async (inputData) => {
  const wordsCount = countWords(
    inputData.messageIn || 'ola este e só para testar, vamos ver quantas palavras é que isto manja! ',
  );

  logDebug('********* inputBillingEvent service **********', inputData.messageIn);
  logDebug('Total Words #', wordsCount);

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const key = day + month + year;

  // increment billing log
  const updateBody = {
    $inc: { totalInputWords: wordsCount },
  };
  // const options = { upsert: true };
  const result = await DB.findAndUpdateBillingLog({ accountId: inputData.accountId }, updateBody, options);
  // increment billing with day key
  const billingDayKey = await DB.findAndUpdateBillingDay(
    { key, accountId: inputData.accountId },
    { $inc: { inputWords: wordsCount } },
    options,
  );

  try {
    return { data: wordsCount, result, billingDayKey };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

/**
 * From the output words, count words
 * - add entry to billing day input
 * - increase total billing input
 */
const outputBillingEvent = async (inputData) => {
  const wordsCount = countWords(
    inputData.messageOut || 'ola este e só para testar, vamos ver quantas palavras é que isto manja! ',
  );

  logDebug('********* inputBillingEvent service **********', inputData);
  logDebug('Total Words #', wordsCount);

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const key = day + month + year;

  // increment billing log
  // const options = { upsert: true };
  const billingLogOut = await DB.findAndUpdateBillingLog(
    { accountId: inputData.accountId },
    { $inc: { totalOutputWords: wordsCount } },
    options,
  );

  // increment billing with day key
  const billingDayKey = await DB.findAndUpdateBillingDay(
    { key, accountId: inputData.accountId },
    { $inc: { outputWorks: wordsCount } },
    options,
  );

  try {
    return { data: wordsCount, billingLogOut, billingDayKey };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

//   usage: { prompt_tokens: 261, completion_tokens: 60, total_tokens: 321 }
const updateBilling = async ({ accountId }, { prompt_tokens, completion_tokens, total_tokens } = {}) => {
  logDebug(
    `updateBilling ${accountId}:
     prompt_tokens: ${prompt_tokens}; completion_tokens: ${completion_tokens}; total_tokens: ${total_tokens}`,
  );

  const updateBody = {
    $inc: { totalInputWords: prompt_tokens, totalOutputWords: completion_tokens },
  };
  const updateBodyDaily = {
    $push: {
      dailyValues: {
        date: new Date() + 1, // Current date
        inputWords: prompt_tokens + 4, // Replace with the actual input value for the day
        outputWords: completion_tokens + 5, // Replace with the actual output value for the day
      },
    },
  };

  try {
    // increment billing log
    const result = await DB.findAndUpdateBillingLog({ accountId }, updateBody, options);

    // FIXME: this is not working, the date key is wrong
    // increment billing with day key
    const billingDayKey = await DB.findBillingDayUpdate({ accountId }, updateBodyDaily, options);
    logDebug('billingDayKey', billingDayKey);
    return { result, billingDayKey };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

module.exports = { inputBillingEvent, outputBillingEvent, updateBilling };
