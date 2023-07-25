'use strict'

const { Router } = require('express')
const routes = require('~/routes')

let router = Router()

router.use('/api/v1', routes)
module.exports = function routesFactory() {
  return router
}
