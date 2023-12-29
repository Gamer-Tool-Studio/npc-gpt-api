// eslint-disable-next-line arrow-body-style

import { CreateCompletionResponseUsage } from 'openai';

// import { encode } from 'gpt-3-encoder';
// const { encode } = await import('gpt-3-encoder');
const { encode } = require('gpt-3-encoder');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('billing-service');
// const { encode } = require('gpt-3-encoder');
const DB = require('src/database');

function countWords(str: string) {
  // return str.trim().split(/\s+/).length;
  return encode(str).length;
}

const options = { upsert: true, new: true };

/**
 * From the input words, count words
 * - add entry to billing day input
 * - increase total billing input
 */
const updateBilling = async (
  accountId: string,
  { prompt_tokens, completion_tokens, total_tokens }: CreateCompletionResponseUsage,
) => {
  logDebug(
    `updateBilling ${accountId}:
    prompt_tokens: ${prompt_tokens}; completion_tokens: ${completion_tokens}; total_tokens: ${total_tokens}`,
  );
  const today = new Date();
  const day = today.getDate().toString();
  const month = (today.getMonth() + 1).toString();
  const year = today.getFullYear().toString();
  const key = day + month + year;
  logDebug('day key', key);

  // increment billing log
  const updateBody = {
    $inc: { inputWords: prompt_tokens, outputWords: completion_tokens },
  };
  // const options = { upsert: true };
  const result = await DB.findAndUpdateBillingLog({ accountId }, updateBody, options);
  // increment billing with day key
  const billingDayKey = await DB.findAndUpdateBillingDay({ key, accountId }, updateBody, options);

  try {
    return { result, billingDayKey };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

export { updateBilling, countWords };
