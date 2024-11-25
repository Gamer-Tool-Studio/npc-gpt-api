import { Request, Response, Router } from 'express';
import DB from 'src/database';

import config from 'src/config';

const path = require('path');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('stripe');

const { STRIPE_SKU_PLATFORM } = config;

const router = Router();

router.get('/nft/:id.json', async (req: Request, res: Response) => {
  let characterId = req.params.id;

  try {
    if (characterId.startsWith('0x')) {
      characterId = parseInt(characterId, 16).toString();
    }
    const characterJSON = await DB.findOneCharacter({ id: `cluaido:${characterId}` });
    logDebug('characterJSON', characterJSON);
    res.json(characterJSON);
  } catch (error) {
    logError('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/nft/:id', async (req: Request, res: Response) => {
  let characterId = req.params.id;

  try {
    if (characterId.startsWith('0x')) {
      characterId = parseInt(characterId, 16).toString();
    }
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
    const pricingList = await DB.find('sku', { platform: STRIPE_SKU_PLATFORM }, null, { sort: { value: 1 } });
    logDebug('pricingList', pricingList);

    res.json(pricingList);
  } catch (error) {
    logError('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
