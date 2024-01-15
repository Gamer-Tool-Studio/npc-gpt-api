const { webhook } = require('src/router/stripe');
const { Router, raw } = require('express');

const router = Router();

router.use('/api/v1/stripe/webhook', raw({ type: 'application/json' }), webhook);
module.exports = function routesFactory() {
  return router;
};
