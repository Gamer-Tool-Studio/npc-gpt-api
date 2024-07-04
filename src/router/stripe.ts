import { Request, Response, Router } from 'express';
import config from 'src/config';
import { addTokens, createPaymentLink } from 'src/services/billing';
import Stripe from 'stripe';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('stripe');

const { FRONTEND_URL, STRIPE_WEBHOOK_SECRET } = config;

const router = Router();

router.get('/success', async (req: Request, res: Response) => {
  try {
    logDebug(' **** callback **** query ', req.query);

    // const checkBalanceResponse = await checkBalance(req.query.session_id as string);
    // logDebug(' **** checkBalanceResponse ****  ', checkBalanceResponse);

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

// http://localhost:3002/api/v1/stripe/success?session_id=cs_test_a1zN6zcCvbHSlKgkODuSjwgKImHsqZVlPNHwPKUhpsxFkkYlDcwmnEXLs1
router.post('/create', async (req: Request, res: Response) => {
  try {
    logDebug(' **** create **** body ', req.body, req.user);

    logDebug(' **** email **** user ', req.user?.email);

    if (!req.user?.email) {
      throw new Error('No user email');
    }

    const createPaymentLinkResponse = await createPaymentLink(
      req.body.price_id as string,
      req.body.mode as Stripe.Checkout.SessionCreateParams.Mode,
      req.user?.email as string,
    );
    logDebug(' **** createPaymentLinkResponse ****  ', createPaymentLinkResponse);

    res.send(createPaymentLinkResponse);
  } catch (ex) {
    logError('/create post', ex);
    res.status(500).json({ error: ex });
  }
});

export const webhook = async (request: Request, response: Response) => {
  logDebug(' **** webhook ****  ');

  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (STRIPE_WEBHOOK_SECRET) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = Stripe.webhooks.constructEvent(
        request.body,
        signature as unknown as string | string[] | Buffer,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: unknown) {
      logError('⚠️  Webhook signature verification failed.', err);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      logDebug(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      logDebug('paymentIntent', paymentIntent);
      return response.send(paymentIntent);
    }
    case 'payment_method.attached': {
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      logDebug('paymentMethod', paymentMethod);
      break;
    }
    case 'checkout.session.async_payment_succeeded': {
      const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      logDebug('checkoutSessionAsyncPaymentSucceeded', checkoutSessionAsyncPaymentSucceeded);
      break;
    }
    case 'checkout.session.completed': {
      const checkoutSessionCompleted = event.data.object;
      // Then define and call a function to handle the event checkout.session.completed
      logDebug('checkoutSessionCompleted', checkoutSessionCompleted);
      const addTokensResponse = await addTokens(checkoutSessionCompleted);
      logDebug(' **** addTokensResponse ****  ', addTokensResponse);
      response.send(addTokensResponse);
      break;
    }
    default:
      // Unexpected event type
      logError(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return response.send();
};

export default router;
