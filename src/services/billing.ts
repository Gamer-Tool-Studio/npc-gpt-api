// eslint-disable-next-line arrow-body-style
// 4242424242424242

import { CreateCompletionResponseUsage } from 'openai';
import mongoDB from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';

// import { encode } from 'gpt-3-encoder';
// const { encode } = await import('gpt-3-encoder');
// const { encode } = require('gpt-3-encoder');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('billing-service');
// const { encode } = require('gpt-3-encoder');
// import DB from 'src/database';

const stripe = require('stripe')(
  'sk_test_51ORmw8IMj18eIBAqlRyl0sq4xuBwyDY7v7T5aWPVhVcfi5YpAGWLhGP02TJFYpLec0dWX1bBLmE59IlI9UzkkOBj00VYu5Eq3E',
);

type CheckoutSessionCompleted = {
  [k: string]: any;
  customer_email?: string;
  payment_intent?: string;
};

// function countWords(str: string) {
//   // return str.trim().split(/\s+/).length;
//   return encode(str).length;
// }
const options = { upsert: true, new: true };

const addTokens = async (checkoutSessionCompleted: CheckoutSessionCompleted) => {
  try {
    logDebug('addTokens:');
    // verificar se session id já foi usado antes atraves da BD
    const { customer_email: customerEmail, payment_intent: paymentIntent } = checkoutSessionCompleted;
    logDebug('customerEmail', customerEmail);
    const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntent);
    logDebug('paymentIntentResponse', paymentIntentResponse);

    // const session = await stripe.checkout.sessions.retrieve(checkoutSessionCompleted);
    // logDebug('session', session);

    const user = await mongoDB.findOneAndUpdate(DataBaseSchemas.USER, { email: customerEmail });
    logDebug('user id', user.toJSON().id);

    // Access purchased items
    const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSessionCompleted.id);
    const purchasedItem = lineItems.data[0];

    logDebug('purchasedItem', purchasedItem);

    const item = await mongoDB.findSKU({ price_id: purchasedItem?.price?.id });
    logDebug('item', item);

    const updateBody = {
      $inc: { availableInputTokens: Number(item.inputTokens), availableOutputTokens: Number(item.outputTokens) },
    };

    const userBilling = await mongoDB.findAndUpdateBillingLog({ accountId: user.toJSON().id }, updateBody, options);
    logDebug('userBilling', userBilling);

    return `<html>
    <body>
    <h1>Thanks for your order, ${item} !</h1>
     <h2> 
     ${JSON.stringify(purchasedItem)} 
      </h2> 
    </body>
  </html>`;

    // const result = await mongoDB.findAndUpdateBillingLog({ accountId }, updateBody, options);
  } catch (error) {
    logError(error);
    return error;
  } finally {
    // const session = await stripe.checkout.sessions.expire(session_id);
    // logDebug('session', session);
  }
};

export const checkBalance = async (accountId?: string) => {
  logDebug(`checkBalance ${accountId}`);
  const userBilling = await mongoDB.findBillingLog({ accountId });

  return userBilling;
};

const createPaymentLink = async (price: string, mode: string, email: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    mode,
    success_url: 'http://localhost:3002/api/v1/stripe/success?session_id={CHECKOUT_SESSION_ID}', // Redirect after successful payment
    cancel_url: 'https://gamertoolstudio.com/pricing/', // Redirect if the user cancels the payment
    customer_email: email, // Specify the customer's email here
  });

  return session;
};

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
    $dec: { availableInputTokens: prompt_tokens, availableOutputTokens: completion_tokens },
  };
  // const options = { upsert: true };
  const result = await mongoDB.findAndUpdateBillingLog({ accountId }, updateBody, options);
  // increment billing with day key
  const billingDayKey = await mongoDB.findBillingLog({ key, accountId }, updateBody, options);

  try {
    return { result, billingDayKey };
  } catch (ex) {
    logError('Error validating data ', ex);
    throw ex;
  }
};

export { updateBilling, addTokens, createPaymentLink };
