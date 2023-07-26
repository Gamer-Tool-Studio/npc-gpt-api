import { ChatCompletionRequestMessage } from 'openai';
import openai from 'src/lib/openai';
import type { CharacterType } from 'src/types';

import { characterScriptBuilder } from '~/lib/characterBuilder';

// type GeneratePromptRes = Record<string, string>;
type GeneratePromptReq = ({
  characterJson,
  currentHistory,
}: {
  characterJson: CharacterType;
  currentHistory: Array<ChatCompletionRequestMessage>;
}) => Promise<Record<string, Array<ChatCompletionRequestMessage>>>;

const generatePrompt: GeneratePromptReq = async ({ characterJson, currentHistory }) => {
  const character = characterScriptBuilder(characterJson);

  const messages = [
    {
      role: 'system',
      content: character,
    },
    ...currentHistory,
  ] as Array<ChatCompletionRequestMessage>;

  return { messages };
};

const listEngines = async () => {
  const response = await openai.listEngines();
  return response.data;
};

const createCompletion = async ({ messages }: { messages: Array<ChatCompletionRequestMessage> }) => {
  const response = await openai.createChatCompletion({
    model: 'text-davinci-003',
    messages,
    max_tokens: 7,
    temperature: 0,
  });
  return response.data;
};

export { createCompletion, listEngines, generatePrompt };
