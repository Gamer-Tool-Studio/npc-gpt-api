import { ChatCompletionRequestMessage, CreateCompletionResponseUsage } from 'openai';
import { ErrorType } from 'src/constants';
import { characterScriptBuilder } from 'src/lib/characterBuilder';
import { isArrayOf } from 'src/lib/util';
import { hasBalance, updateBilling } from 'src/services/billing';
import { createCompletion, generatePrompt } from 'src/services/openai';
import { CharacterType } from 'src/types';
import { ChatCompletionRequestMessageClass } from 'src/types/openai';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chatService');

type SendMessageParams = {
  userId: string;
  userInput: string;
  chatHistory: Array<ChatCompletionRequestMessage>;
  characterContext?: CharacterType;
};

export default async function sendMessage({
  userId, userInput, chatHistory, characterContext,
}: SendMessageParams) {
  const hasBalanceResult = await hasBalance(userId);
  logDebug('send-message hasBalance:', hasBalanceResult);
  if (!hasBalanceResult) {
    logError('Insufficient balance');
    throw new Error(ErrorType.INSUFFICIENT_BALANCE);
  }

  logDebug('send-message userInput:', userInput);
  let currentChatHistory = chatHistory;
  if (!isArrayOf<ChatCompletionRequestMessage>(chatHistory, ['role', 'content'])) {
    logDebug('create new history for character', characterContext);

    if (!characterContext) {
      throw new Error('A characterContext object is required');
    }

    const character = characterScriptBuilder(characterContext);
    currentChatHistory = [new ChatCompletionRequestMessageClass('system', character, characterContext.name)];
    // is this correct, maybe we should initiate a new history instead of error
    // res.status(500).json({ error: `No History for this ${characterId} and ${playerId}` });
  }

  const { messages } = await generatePrompt({ userInput, chatHistory: currentChatHistory });

  logDebug('chatHistory last message:', messages?.at(-1));

  const response = await createCompletion({ messages });

  logDebug('chatHistory response:', response?.choices?.at(0));

  const updateBillingRes = await updateBilling(
    userId,
    response.usage as CreateCompletionResponseUsage,
  );
  logDebug('updated user billing: \ninputWords:', updateBillingRes?.billingDayKey?.inputWords, ' outputWords: ', updateBillingRes?.billingDayKey?.outputWords);

  const { choices } = response;

  if (choices && choices.length > 0) {
    const generatedResponse = choices[0].message;
    return { response: generatedResponse, chatHistory: [...messages, generatedResponse] };
  }
  throw new Error(ErrorType.NO_RESPONSE_FROM_OPENAI);
}
