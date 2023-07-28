import { ChatCompletionRequestMessage } from 'openai';
import openai from 'src/lib/openai';
import { ChatCompletionRequestMessageClass } from 'src/types/openai.types';
// import type { CharacterType } from 'src/types';

// import { characterScriptBuilder } from '~/lib/characterBuilder';

// type GeneratePromptRes = Record<string, string>;
type GeneratePromptReq = ({
  userInput,
  currentHistory,
}: {
  userInput: string;
  currentHistory: Array<ChatCompletionRequestMessage>;
}) => Promise<Record<string, Array<ChatCompletionRequestMessage>>>;

const generatePrompt: GeneratePromptReq = async ({ userInput, currentHistory }) => {
  // const character = characterScriptBuilder(characterJson);

  const messages = [
    ...currentHistory,
    new ChatCompletionRequestMessageClass('user', userInput),
  ] as Array<ChatCompletionRequestMessage>;

  return { messages };
};

const listEngines = async () => {
  const response = await openai.listEngines();
  return response.data;
};

const createCompletion = async ({ messages }: { messages: Array<ChatCompletionRequestMessage> }) => {
  // const response = await openai.createChatCompletion({
  //   model: 'text-davinci-003',
  //   messages,
  //   max_tokens: 7,
  //   temperature: 0,
  // });

  // return response.data;
  return { choices: [{ message: messages.at(-1) }] };
};

export { createCompletion, listEngines, generatePrompt };
