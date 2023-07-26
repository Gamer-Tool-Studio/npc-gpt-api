import { Router, Request, Response } from 'express';
import { listEngines, createCompletion, generatePrompt } from '~/services/openai';
import { getHistory } from 'src/services/database';
import parameterValidator from 'src/core-services/parameterValidator';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat');

const router = Router();

router.get('/list-engines', async (req: Request, res: Response) => {
  try {
    const engines = await listEngines();
    res.status(200).json(engines);
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post('/send-message', async (req: Request, res: Response) => {
  const params = ['userInput', 'characterId', 'playerId'];
  try {
    parameterValidator(req.body, params);

    const userInput = req.body.text;

    const { characterId, playerId } = req.body;

    // TODO: when does the character is initiated
    const { characterJson } = req.body;

    // TODO: get message from redis to get the character history
    logDebug('send-message request:', userInput);

    const currentHistory = await getHistory({ characterId, playerId });

    if (currentHistory == null) {
      res.status(500).json({ error: `No History for this ${characterId} and ${playerId}` });
    }

    const { messages } = await generatePrompt({ characterJson, currentHistory });

    logDebug('messages:', messages);

    const response = await createCompletion({ messages });

    logDebug('Response:', response);

    const { choices } = response;

    if (choices && choices.length > 0) {
      const generatedResponse = choices[0].message?.content?.trim();
      res.json({ response: generatedResponse });
    } else {
      res.status(500).json({ error: 'No response from the OpenAI API' });
    }
  } catch (error: any) {
    logError('Error:', error?.messag);
    res.status(500).json({ error: 'An error occurred', message: error.message });
  }
});

router.post('/generate-prompt', async (req: Request, res: Response) => {
  const characterJson = req.body;
  const { characterId, playerId } = req.body;

  try {
    logDebug('send-message request:', characterJson);
    const currentHistory = await getHistory({ characterId, playerId });

    const response = await generatePrompt({ characterJson, currentHistory });

    logDebug('Response:', response);

    const { prompt } = await response;

    if (prompt) {
      res.json({ response: prompt });
    } else {
      res.status(500).json({ error: 'No response from the OpenAI API' });
    }
  } catch (error: any) {
    logError('Error:', error?.message);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// router.put('/:id', async (req: Request, res: Response) => {
//   try {
//     const updated = await createCompletion({ prompt: req.params.id });
//     res.status(200).json(updated);
//   } catch (ex) {
//     logError('get todo ', ex);
//     res.status(500).json({ error: ex });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     const del = await createCompletion({ prompt: req.params.id });
//     res.status(200).json(del);
//   } catch (ex) {
//     logError('get todo ', ex);
//     res.status(500).json({ error: ex });
//   }
// });

export default router;
