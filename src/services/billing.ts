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

    const { customer_email: customerEmail, payment_intent: paymentIntent, metadata } = checkoutSessionCompleted;
    logDebug('customerEmail', customerEmail);
    logDebug('metadata', metadata);

    const user = await mongoDB.findOneAndUpdate(DataBaseSchemas.USER, { email: customerEmail });
    logDebug('user id', user.toJSON().id);

    // Check if session already processed
    const checkoutSessionStored = await mongoDB.findOne(DataBaseSchemas.CHECKOUT, { accountId: user.toJSON().id });
    logDebug('checkoutSessionStored', checkoutSessionStored);
    
    const checkCheckoutSession = checkoutSessionStored?.checkoutSessions
      .find((session: { id:string }) => session.id === checkoutSessionCompleted.id);

    if (checkCheckoutSession) {
      logDebug('Session already processed', checkCheckoutSession);
      return checkCheckoutSession;
    }

    let purchasedPriceId: string | undefined;

    // Check if price_id is in metadata (for test purchases or direct tracking)
    if (metadata?.price_id) {
      purchasedPriceId = metadata.price_id;
      logDebug('Price ID from metadata:', purchasedPriceId);
    } else {
      // Retrieve from Stripe API for real purchases
      if (!paymentIntent) {
        logError('No paymentIntent found');
        return new Error('No paymentIntent found');
      }

      const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntent);
      logDebug('paymentIntentResponse', paymentIntentResponse);

      // Get line items to find the purchased price
      const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSessionCompleted.id);
      const purchasedItem = lineItems.data[0];
      purchasedPriceId = purchasedItem?.price?.id;
    }

    logDebug('Purchased price ID:', purchasedPriceId);

    // Map Stripe Price IDs to token amounts
    const priceToTokensMap: { [key: string]: { input: number, output: number } } = {
      [process.env.STRIPE_PRICE_SOLO_DEV || '']: { input: 25000, output: 10000 },
      [process.env.STRIPE_PRICE_INDIE_STUDIO || '']: { input: 250000, output: 100000 },
      [process.env.STRIPE_PRICE_ENTERPRISE || '']: { input: 25000000, output: 10000000 },
    };

    const tokens = priceToTokensMap[purchasedPriceId || ''];
    if (!tokens) {
      logError('Unknown price ID:', purchasedPriceId);
      throw new Error('Unknown price ID - cannot allocate tokens');
    }

    const inputTokens = tokens.input;
    const outputTokens = tokens.output;

    logDebug('Adding tokens:', { inputTokens, outputTokens });

    // Update billing with new tokens
    const updateBody = {
      $inc: { 
        availableInputTokens: inputTokens, 
        availableOutputTokens: outputTokens 
      },
    };
    
    const userBilling = await mongoDB.findOneAndUpdate(
      DataBaseSchemas.BILLING,
      { accountId: user.toJSON().id },
      updateBody,
      options,
    );

    // Store checkout session to prevent double processing
    const sessionUpdateBody = { 
      accountId: user.toJSON().id, 
      $push: { checkoutSessions: checkoutSessionCompleted } 
    };
    
    const checkout = await mongoDB.findOneAndUpdate(
      DataBaseSchemas.CHECKOUT,
      { accountId: user.toJSON().id },
      sessionUpdateBody,
      options,
    );

    logDebug('checkout', checkout);
    logDebug('userBilling updated', userBilling);

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

const createPaymentLink = async (stripePriceId: string, mode: Stripe.Checkout.SessionCreateParams.Mode, email: string) => {
  const { FRONTEND_URL } = config;
  const paymentMethodTypes = STRIPE_PAYMENT_METHODS_TYPES.split(',') as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

  logDebug('Creating checkout session:', { stripePriceId, mode, email });
  
  // For development, use localhost backend URL
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price: stripePriceId, // Use the Stripe Price ID directly
        quantity: 1,
      },
    ],
    mode,
    success_url: `${backendUrl}/api/v1/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/pricing?payment=cancelled`,
    customer_email: email,
    // Metadata to track the purchase
    metadata: {
      user_email: email,
      price_id: stripePriceId,
    },
  });

  logDebug('Checkout session created:', session.id);
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
