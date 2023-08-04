const { authLogin, resetApiKey, createAccount } = require('src/services/auth')
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('chat')

const { Router } = require('express')

const router = Router()

router.post('/gen-auth', async (request, response) => {
  try {
    console.log(' **** Auth token route **** ')

    console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken)

    response.status(200).json({
      token: response.locals.authToken,
      username: response.locals.username
    })
  } catch (ex) {
    logError('get todo ', ex)
    response.status(500).json({ error: ex })
  }
})

router.post('/login', async (request, response) => {
  try {
    console.log(' **** login **** ')

    console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken)

    let authToken = await authLogin()

    response.status(200).json({
      token: authToken
    })
  } catch (ex) {
    logError('login error ', ex)
    response.status(500).json({ error: ex })
  }
})

router.post('/reset-secret', async (request, response) => {
  try {
    console.log(' **** reset-secret **** route ')

    console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken)

    response.status(200).json({
      token: response.locals.authToken,
      username: response.locals.username
    })
  } catch (ex) {
    logError('get todo ', ex)
    response.status(500).json({ error: ex })
  }
})

router.post('/create-account', async (request, response) => {
  try {
    console.log(' **** reset-secret **** route ')

    console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken)

    let a = await createAccount(request.body)
    response.status(200).json({ newAccount: a })
  } catch (ex) {
    logError('create-account log error ', ex)
    response.status(500).json({ error: ex })
  }
})

module.exports = router
