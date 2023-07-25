import { listEngines, createCompletion, generatePrompt } from '~/services/openai';
import { Router, Request, Response } from 'express';

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
  const userInput = req.body.text;

  try {
    logDebug('send-message request:', userInput);

    const response = await createCompletion({ prompt: userInput });

    logDebug('Response:', response);

    const { choices } = await response;

    if (choices && choices.length > 0) {
      const generatedResponse = choices[0]?.text?.trim();
      res.json({ response: generatedResponse });
    } else {
      res.status(500).json({ error: 'No response from the OpenAI API' });
    }
  } catch (error: any) {
    logError('Error:', error?.message);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.post('/generate-prompt', async (req: Request, res: Response) => {
  const characterJson = req.body;

  try {
    logDebug('send-message request:', characterJson);

    const response = await generatePrompt({ characterJson });

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

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await createCompletion({ prompt: req.params.id });
    res.status(200).json(updated);
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const del = await createCompletion({ prompt: req.params.id });
    res.status(200).json(del);
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
