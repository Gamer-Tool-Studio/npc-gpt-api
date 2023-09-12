import { Router, Request, Response } from 'express';
import { listEngines, createCompletion, generatePrompt } from '~/services/openai';
// import { getCharacterJson } from 'src/services/database';
import parameterValidator from 'src/core-services/parameterValidator';
import { characterScriptBuilder } from 'src/lib/characterBuilder';
import { isArrayOf } from 'src/lib/util';
import { ChatCompletionRequestMessage } from 'openai';
import { ChatCompletionRequestMessageClass } from 'src/types/openai.types';
import { inputBillingEvent } from 'src/services/billing';

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
  const params = ['userInput', 'chatHistory'];
  try {
    parameterValidator(req.body, params);

    const { userInput } = req.body;
    let { chatHistory } = req.body as { chatHistory: Array<ChatCompletionRequestMessage> };

    // TODO: when does the character is initiated

    // TODO: get message from redis to get the character history
    logDebug('send-message userInput:', userInput);

    const billing = await inputBillingEvent({ messageIn: userInput });
    logDebug('send-message inputBillingEvent res:', billing);

    // eslint-disable-next-line @typescript-eslint/naming-convention, object-curly-newline

    if (!isArrayOf<ChatCompletionRequestMessage>(chatHistory, ['role', 'content', 'name', 'function_call'])) {
      const { characterContext } = req.body;
      logDebug('create new history for character', characterContext);

      if (!characterContext) {
        throw new Error('A characterContext object is required');
      }

      // const { characterJson } = await getCharacterJson(characterContext);
      const character = characterScriptBuilder(characterContext);
      chatHistory = [new ChatCompletionRequestMessageClass('system', character)];
      // is this correct, maybe we should initiate a new history instead of error
      // res.status(500).json({ error: `No History for this ${characterId} and ${playerId}` });
    }

    const { messages } = await generatePrompt({ userInput, chatHistory });

    logDebug('messages:', messages);

    const response = await createCompletion({ messages });

    logDebug('Response:', response);

    const { choices } = response;

    if (choices && choices.length > 0) {
      const generatedResponse = choices[0].message;
      res.json({ response: generatedResponse, chatHistory: [...chatHistory, generatedResponse] });
    } else {
      res.status(500).json({ error: 'No response from the OpenAI API' });
    }
  } catch (error: any) {
    logError('Error:', error);
    res.status(500).json({ error: 'An error occurred', message: error.message });
  }
});

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