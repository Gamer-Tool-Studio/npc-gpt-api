const writeError = require('~/core-services/logFunctionFactory').getErrorLogger('routes')

const { Router } = require('express')

const fs = require('fs')
const path = require('path')

const router = Router()

function loadRoutes() {
  const routePath = path.resolve('./src/routes')

  fs.readdirSync(routePath).forEach(async (file) => {
    const extension = file.slice(file.length - 3, file.length)
    if (file === 'index.js' || extension !== '.js') return
    try {
      const baseRoot = file.slice(0, file.length - 3)
      const route = await require(`./${file}`)
      // let route = require('./chat')
      router.use(`/${baseRoot}`, route)
    } catch (err) {
      writeError('Error loading route ', file, ' ', err)
    }
  })
}

loadRoutes()

module.exports = router

/**
 * @swagger
 * definitions:
 *  apiInfo:
 *    properties:
 *      title:
 *        type: string
 *        description: The title of the API
 *      environment:
 *        type: string
 *        description: The environment
 *      version:
 *        type: string
 *        description: The version of the API
 *      commit:
 *        type: string
 *        description: The commit hash
 *  todo:
 *    properties:
 *      title:
 *        type: string
 *        description: Description of the To Do
 *      description:
 *        type: string
 *        description: Todo Description
 *      author:
 *        type: string
 *        description: The author of that todo
 *      state:
 *        type: string
 *        description: the state of that todo [ative, delete, completed]
 *      tags:
 *        type: array
 *        description: string arrays representing all the tags of the todo tags
 */

/**
 * @swagger
 * /getRoot:
 *  get:
 *    tags:
 *      - GetRoot
 *    description: Returns information about the API
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The API information
 *        schema:
 *          $ref: '#/definitions/apiInfo'
 */
