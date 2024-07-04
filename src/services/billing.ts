// eslint-disable-next-line arrow-body-style
// 4242424242424242

import { CreateCompletionResponseUsage } from 'openai';
import mongoDB from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';
import config from 'src/config';

import Stripe from 'stripe';

const { STRIPE_SECRET_KEY, STRIPE_PAYMENT_METHODS_TYPES } = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('billing-service');

const stripe = new Stripe(STRIPE_SECRET_KEY);

type CheckoutSessionCompleted = {
  [k: string]: any;
  customer_email?: string;
  payment_intent?: string;
};

const options = { upsert: true, new: true };

const addTokens = async (checkoutSessionCompleted: CheckoutSessionCompleted) => {
  try {
    logDebug('addTokens:', checkoutSessionCompleted.id);

    // verificar se session id já foi usado antes atraves da BD

    const { customer_email: customerEmail, payment_intent: paymentIntent } = checkoutSessionCompleted;
    logDebug('customerEmail', customerEmail);

    const user = await mongoDB.findOneAndUpdate(DataBaseSchemas.USER, { email: customerEmail });
    logDebug('user id', user.toJSON().id);

    const checkoutSessionStored = await mongoDB.findOne(DataBaseSchemas.CHECKOUT, { accountId: user.toJSON().id });

    logDebug('checkoutSessionStored', checkoutSessionStored);
    const checkCheckoutSession = checkoutSessionStored?.checkoutSessions
      .find((session: { id:string }) => session.id === checkoutSessionCompleted.id);

    if (checkCheckoutSession) {
      logDebug('checkCheckoutSession: Session already processed', checkCheckoutSession);
      return checkCheckoutSession;
    }

    if (!paymentIntent) {
      logError('No paymentIntent found');
      return new Error('No paymentIntent found');
    }
    const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntent);
    logDebug('paymentIntentResponse', paymentIntentResponse);

    // Access purchased items
    const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSessionCompleted.id);
    const purchasedItem = lineItems.data[0];

    logDebug('purchasedItem', purchasedItem);

    const item = await mongoDB.findSKU({ price_id: purchasedItem?.price?.id });
    logDebug('item', item);

    const updateBody = {
      $inc: { availableInputTokens: Number(item.inputTokens), availableOutputTokens: Number(item.outputTokens) },
    };
    const userBilling = await mongoDB.findOneAndUpdate(
      DataBaseSchemas.BILLING,
      { accountId: user.toJSON().id },
      updateBody,
      options,
    );

    const sessionUpdateBody = { accountId: user.toJSON().id, $push: { checkoutSessions: checkoutSessionCompleted } };
    const checkout = await mongoDB.findOneAndUpdate(
      DataBaseSchemas.CHECKOUT,
      { accountId: user.toJSON().id },
      sessionUpdateBody,
      options,
    );

    logDebug('checkout', checkout);

    logDebug('userBilling', userBilling);

    return userBilling;

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
  const userBilling = await mongoDB.findOne(DataBaseSchemas.BILLING, { accountId });
  logDebug('userBilling ', userBilling);

  return userBilling;
};
export const hasBalance = async (accountId?: string) => {
  logDebug(`checkBalance ${accountId}`);
  const userBilling = await mongoDB.findOne(DataBaseSchemas.BILLING, { accountId });
  logDebug('userBilling ', userBilling);

  return userBilling.availableInputTokens > 0 && userBilling.availableOutputTokens > 0;
};

const createPaymentLink = async (price: string, mode: Stripe.Checkout.SessionCreateParams.Mode, email: string) => {
  const paymentMethodTypes = STRIPE_PAYMENT_METHODS_TYPES.split(',') as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    mode,
    success_url: 'https://gamertoolstudio.com/dashboard', // Redirect after successful payment
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
    `updateBilling ${accountId}:\nprompt_tokens: ${prompt_tokens}; completion_tokens: ${completion_tokens}; total_tokens: ${total_tokens}`,
  );
  const today = new Date();
  const day = today.getDate().toString();
  const month = (today.getMonth() + 1).toString();
  const year = today.getFullYear().toString();
  const key = day + month + year;
  logDebug('day key', key);

  try {
  // increment billing log
    const updateBody = {
      $inc: { availableInputTokens: Number(-prompt_tokens), availableOutputTokens: Number(-completion_tokens) },
    };
    const result = await mongoDB.findOneAndUpdate(DataBaseSchemas.BILLING, { accountId }, updateBody, options);
    logDebug('result', result);

    const billingDayKey = await mongoDB.findOneAndUpdate(
      DataBaseSchemas.BILLING_DAY,
      { key, accountId },
      {
        $inc: {
          outputWords: Number(completion_tokens),
          inputWords: Number(prompt_tokens),
        },
      },
      options,
    );

    return { ...result, billingDayKey };
  } catch (ex) {
    logError('Error updating billing ', ex);
    throw ex;
  }
};

export { updateBilling, addTokens, createPaymentLink };
