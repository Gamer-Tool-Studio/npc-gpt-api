const session = require('express-session');
const { Router } = require('express');

// const { nodeEnv } = require('src/config');

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

// router.use(passport.authenticate('session'));

// session({
//   name: 'gts.api',
//   secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
//   saveUninitialized: false,
//   cookie: { maxAge: oneDay, secure: true, sameSite: 'none' }, // nodeEnv === 'production'
//   resave: false,
// }),

module.exports = function sessionFactory() {
  return router;
};
