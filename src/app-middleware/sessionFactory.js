const session = require('express-session');
const { Router } = require('express');
const passport = require('passport');

const router = Router();

const oneDay = 1000 * 60 * 60 * 24;

router.use(
  session({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    // saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  }),
);

//router.use(passport.authenticate('session'));

module.exports = function sessionFactory() {
  return router;
};
