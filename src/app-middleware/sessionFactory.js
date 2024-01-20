const session = require('express-session');
const { Router } = require('express');

const router = Router();

const oneDay = 1000 * 60 * 60 * 24;

router.use(
  session({
    name: 'gts.api',
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  }),
);

module.exports = function sessionFactory() {
  return router;
};
