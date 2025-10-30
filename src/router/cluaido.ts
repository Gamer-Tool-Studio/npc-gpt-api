import { Request, Response, Router } from 'express';
import DB from 'src/database';

import config from 'src/config';

const path = require('path');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('stripe');

const { STRIPE_SKU_PLATFORM } = config;

const router = Router();

router.get('/nft/:id.json', async (req: Request, res: Response) => {
  const characterId = req.params.id;

  try {
    const characterJSON = await DB.findOneCharacter({ id: `cluaido:${characterId}` });
    logDebug('characterJSON', characterJSON);
    res.json(characterJSON);
  } catch (error) {
    logError('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/characters/:id.png', async (req: Request, res: Response) => {
  const characterId = req.params.id;
  logDebug('characterId', characterId);

  try {
    res.sendFile(path.join(__dirname, `./assets/characters/${characterId}.png`));
  } catch (error) {
    logError('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/pricing-list', async (req: Request, res: Response) => {
  logDebug('pricing-list');

  try {
    // New B2B SaaS Pricing Structure
    // Frontend passes the Stripe Price ID directly to /stripe/create
    const pricingList = [
      {
        stripe_price_id: 'trial', // Special case - no Stripe, just signup
        description: 'Trial',
        value: 0,
        inputTokens: 5000,
        outputTokens: 5000,
        users: 1,
        featured: false,
        isFreeTrial: true,
      },
      {
        stripe_price_id: process.env.STRIPE_PRICE_SOLO_DEV || 'CONFIGURE_IN_ENV',
        description: 'Solo Dev',
        value: 9,
        inputTokens: 25000,
        outputTokens: 10000,
        users: 1,
        featured: true,
      },
      {
        stripe_price_id: process.env.STRIPE_PRICE_INDIE_STUDIO || 'CONFIGURE_IN_ENV',
        description: 'Indie Studio',
        value: 59,
        inputTokens: 250000,
        outputTokens: 100000,
        users: 3,
        featured: false,
      },
      {
        stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE || 'CONFIGURE_IN_ENV',
        description: 'Enterprise',
        value: 259,
        inputTokens: 25000000,
        outputTokens: 10000000,
        users: 'Unlimited',
        featured: false,
      },
    ];

    logDebug('pricingList', pricingList);
    res.json(pricingList);
  } catch (error) {
    logError('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
