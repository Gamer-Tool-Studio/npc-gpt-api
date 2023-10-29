import { ChatCompletionRequestMessage } from 'openai';
import openai from 'src/lib/openai';
import { ChatCompletionRequestMessageClass } from 'src/types/openai.types';
// import type { CharacterType } from 'src/types';

// import { characterScriptBuilder } from '~/lib/characterBuilder';

// type GeneratePromptRes = Record<string, string>;
type GeneratePromptReq = ({
  userInput,
  chatHistory,
}: {
  userInput: string;
  chatHistory: Array<ChatCompletionRequestMessage>;
}) => Promise<Record<string, Array<ChatCompletionRequestMessage>>>;

const generatePrompt: GeneratePromptReq = async ({ userInput, chatHistory }) => {
  // const character = characterScriptBuilder(characterJson);
  const messages = [
    ...chatHistory,
    new ChatCompletionRequestMessageClass('user', userInput),
  ] as Array<ChatCompletionRequestMessage>;

  return { messages };
};

const listEngines = async () => {
  const response = await openai.listEngines();
  return response.data;
};

const createCompletion = async ({ messages }: { messages: Array<ChatCompletionRequestMessage> }) => {
  const response = await openai
    .createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 60,
      temperature: 0.5,
    })
    .catch((err) => {
      console.log(err?.response?.data?.error);

      throw new Error(err.response.data.error.message || err);
    });

  return response.data;
  // return { choices: [{ message: messages.at(-1) }] };
};

export { createCompletion, listEngines, generatePrompt };
