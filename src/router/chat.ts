import { Router, Request, Response } from 'express';
import { listEngines } from '~/services/openai';
// import { getCharacterJson } from 'src/services/database';
import parameterValidator from 'src/core-services/parameterValidator';
import { characterScriptBuilder } from 'src/lib/characterBuilder';
import { ChatCompletionRequestMessage } from 'openai';
import sendMessage from 'src/services/chat';
import { ErrorType, errors } from 'src/constants';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat');

const router = Router();

/**
 * @deprecated
 */
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
  const params = ['userInput', 'chatHistory'];
  try {
    parameterValidator(req.body, params);

    const { userInput } = req.body;
    const { chatHistory } = req.body as { chatHistory: Array<ChatCompletionRequestMessage> };
    const { characterContext } = req.body;

    const sendMessageResult = await sendMessage({
      userId: req.user?.id as string, userInput, chatHistory, characterContext,
    });

    res.json(sendMessageResult);
  } catch (error: any) {
    logError('Error:', error?.data?.error || error);
    if (error in ErrorType) {
      res.status(errors[error].status).json({ msg: errors[error].msg });
    } else {
      res.status(500).json({ error, message: `An error occurred: ${error.message}` });
    }
  }
});

/**
 * @deprecated
 */
router.post('/generate-prompt', async (req: Request, res: Response) => {
  const characterJson = req.body;

  try {
    logDebug('send-message request:', characterJson);
    const character = characterScriptBuilder(characterJson);

    // const response = await generatePrompt({ characterJson, chatHistory });

    logDebug('Response:', character);

    if (character) {
      res.json({ characterScript: character });
    } else {
      res.status(500).json({ error: 'No response from the OpenAI API' });
    }
  } catch (error: any) {
    logError('Error:', error?.message);
    res.status(500).json({ errorMsg: 'An error occurred', error });
  }
});

export default router;
