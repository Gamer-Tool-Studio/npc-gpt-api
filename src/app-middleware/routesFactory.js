const { Router } = require('express');
const routes = require('src/router');

const router = Router();
async function loadAssetsRoutes() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  router.use('/assets', await require('src/router/cluaido').default);
}

loadAssetsRoutes();
router.use('/api/v1', routes);
module.exports = function routesFactory() {
  return router;
};
