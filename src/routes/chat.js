import { listEngines, createCompletion, generatePrompt } from '~/services/openai'

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat')

const { Router } = require('express')

const router = Router()

router.get('/list-engines', async (request, response) => {
  try {
    const engines = await listEngines()
    response.status(200).json(engines)
  } catch (ex) {
    logError('get todo ', ex)
    response.status(500).json({ error: ex })
  }
})

router.post('/send-message', async (request, response) => {
  const userInput = request.body.text

  try {
    logDebug('send-message request:', userInput)

    const response = {} //await createCompletion({ prompt: userInput })

    logDebug('Response:', response.status, response.statusText, createCompletion)

    const { choices } = await response.json()

    if (choices && choices.length > 0) {
      const generatedResponse = choices[0].message.content.trim()
      response.json({ response: generatedResponse })
    } else {
      response.status(500).json({ error: 'No response from the OpenAI API' })
    }
  } catch (error) {
    logError('Error:', error?.message)
    response.status(500).json({ error: 'An error occurred' })
  }
})

router.post('/generate-prompt', async (request, res) => {
  const characterJson = request.body

  try {
    logDebug('send-message request:', characterJson)

    const response = await generatePrompt({ characterJson })

    logDebug('Response:', response)

    const { prompt } = await response

    if (prompt) {
      res.json({ response: prompt })
    } else {
      res.status(500).json({ error: 'No response from the OpenAI API' })
    }
  } catch (error) {
    logError('Error:', error?.message)
    res.status(500).json({ error: 'An error occurred' })
  }
})

router.put('/:id', async (request, response) => {
  try {
    const updated = await createCompletion(request.params.id, request.body)
    response.status(200).json(updated)
  } catch (ex) {
    logError('get todo ', ex)
    response.status(500).json({ error: ex })
  }
})

router.delete('/:id', async (request, response) => {
  try {
    const del = await createCompletion(request.params.id)
    response.status(200).json(del)
  } catch (ex) {
    logError('get todo ', ex)
    response.status(500).json({ error: ex })
  }
})

module.exports = router
