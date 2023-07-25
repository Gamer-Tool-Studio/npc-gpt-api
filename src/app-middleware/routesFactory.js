const { Router } = require('express');
const routes = require('src/router');

const router = Router();

router.use('/api/v1', routes);
module.exports = function routesFactory() {
  return router;
};
