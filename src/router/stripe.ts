import { Request, Response, Router } from 'express';
import config from 'src/config';
import { addTokens, createPaymentLink } from 'src/services/billing';
import Stripe from 'stripe';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('stripe');

const { FRONTEND_URL, STRIPE_WEBHOOK_SECRET } = config;

const router = Router();

router.get('/success', async (req: Request, res: Response) => {
  try {
    logDebug(' **** success callback **** query ', req.query);

    const sessionId = req.query.session_id as string;
    
    // In development, manually trigger token addition since webhooks don't work on localhost
    if (process.env.NODE_ENV === 'development' && sessionId) {
      try {
        logDebug('🧪 DEV MODE - Retrieving session and adding tokens');
        
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        logDebug('Session retrieved:', session.id);
        
        // Trigger token addition
        await addTokens(session);
        
        logDebug('✅ Tokens added in dev mode');
      } catch (error: any) {
        logError('Failed to add tokens in dev mode:', error);
      }
    }

    res.redirect(`${FRONTEND_URL}/dashboard?payment=success`);
  } catch (ex: any) {
    logError('success callback error ', ex);
    res.status(500).json({ error: ex?.message || 'Unknown error' });
  }
});

// TEST ENDPOINT - Only for local development
// Simulates a successful Stripe purchase to test webhook flow
router.post('/test-purchase', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test endpoint not available in production' });
    }

    const { email, price_id } = req.body;
    
    if (!email || !price_id) {
      return res.status(400).json({ error: 'Missing email or price_id' });
    }

    logDebug('🧪 TEST PURCHASE - Simulating webhook for:', { email, price_id });

    // Simulate a checkout.session.completed event
    const mockCheckoutSession = {
      id: 'cs_test_manual_' + Date.now(),
      customer_email: email,
      payment_intent: 'pi_test_manual_' + Date.now(),
      metadata: {
        user_email: email,
        price_id: price_id,
      },
      mode: 'payment',
      status: 'complete',
      payment_status: 'paid',
    };

    // Create a mock line item for the session
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const price = await stripe.prices.retrieve(price_id);
    
    // Manually call addTokens with proper session structure
    const result = await addTokens(mockCheckoutSession as any);
    
    logDebug('🧪 TEST PURCHASE - Tokens added:', result);
    
    res.json({ 
      success: true, 
      message: 'Test purchase processed - tokens added',
      result 
    });
  } catch (ex: any) {
    logError('🧪 TEST PURCHASE - Error:', ex);
    res.status(500).json({ error: ex?.message || 'Unknown error' });
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
  } catch (ex: any) {
    logError('/create post', ex);
    res.status(500).json({ error: ex?.message || 'Unknown error' });
  }
});

export const webhook = async (request: Request, response: Response) => {
  logDebug(' **** webhook ****  ');

  let event = request.body;
  
  // Parse raw body if it's a Buffer (from raw body parser)
  if (Buffer.isBuffer(request.body)) {
    try {
      event = JSON.parse(request.body.toString());
    } catch (err) {
      logError('Failed to parse webhook body', err);
      return response.sendStatus(400);
    }
  }
  
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
