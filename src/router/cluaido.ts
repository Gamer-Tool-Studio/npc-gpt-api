import { Request, Response, Router } from 'express';

const DB = require('src/database');
// const fs = require('fs').promises;
const path = require('path');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('stripe');

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

export default router;
