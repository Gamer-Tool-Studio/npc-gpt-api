import { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai';
import openai from 'src/lib/openai';
import { ChatCompletionRequestMessageClass } from 'src/types/openai';

import config from 'src/config';

const { TESTING, OPENAI_GPT_MODEL } = config;

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

const createCompletion = async ({
  messages,
}: {
  messages: Array<ChatCompletionRequestMessage>;
}): Promise<CreateChatCompletionResponse> => {
  if (TESTING) {
    return {
      id: '',
      object: '',
      created: 0,
      model: '',
      choices: [{ message: messages.at(-1) }],
      usage: { prompt_tokens: 406, completion_tokens: 60, total_tokens: 466 },
    };
  }

  const response = await openai
    .createChatCompletion({
      model: OPENAI_GPT_MODEL,
      messages,
      max_tokens: 4096,
      temperature: 0.5,
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err?.response?.data?.error);

      throw new Error(err.response.data.error.message || err);
    });

  return response.data;
  // return { choices: [{ message: messages.at(-1) }] };
};

export { createCompletion, listEngines, generatePrompt };
