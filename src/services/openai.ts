import openai from 'src/lib/openai';
import type { CharacterType } from 'src/types';

import { promptTemplate } from '~/lib/characterBuilder';

type GeneratePromptRes = Record<string, string>;
type GeneratePromptReq = ({ characterJson }: { characterJson: CharacterType }) => Promise<GeneratePromptRes>;

const generatePrompt: GeneratePromptReq = async ({ characterJson }) => {
  const prompt = promptTemplate(characterJson);

  return { prompt };
};

const listEngines = async () => {
  const response = await openai.listEngines();
  return response.data;
};

const createCompletion = async ({ prompt }: { prompt: string }) => {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 7,
    temperature: 0,
  });
  return response.data;
};

export { createCompletion, listEngines, generatePrompt };
