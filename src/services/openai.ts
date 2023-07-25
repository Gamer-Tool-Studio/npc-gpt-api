import openai from 'src/lib/openai'
import type { characterType } from 'src/types'

import { promptTemplate } from '~/lib/characterBuilder'

type generatePromptRes = Record<string, string>
type generatePromptReq = ({ characterJson }: { characterJson: characterType }) => Promise<generatePromptRes>

const generatePrompt: generatePromptReq = async ({ characterJson }) => {
  const prompt = promptTemplate(characterJson)

  return { prompt }
}

module.exports = {
  createCompletion: async ({ prompt }: { prompt: string }) => {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 7,
      temperature: 0
    })
    return response.data
  },
  listEngines: async () => {
    const response = await openai.listEngines()
    return response.data
  },
  generatePrompt
}
