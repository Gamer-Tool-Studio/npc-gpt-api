const { Router } = require('express');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('passport');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const DB = require('src/database');
var bcrypt = require('bcryptjs');

const _router = Router();
_router.use(passport.initialize());
_router.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async function (username, password, done) {
      try {
        logDebug('username 1 ', username);
        logDebug('password  2 ', password);
        let user = await DB.findUser({ username: username }, null, null);

        if (user && user.length <= 0) {
          return done(null, false);
        }
        user = user[0];
        if (!user.verifyPassword(password)) {
          return done(null, false);
        }
        logDebug('ok!! ', done);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  logDebug('serialize user  ', user);
  done(null, user.id);
  // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(async function (id, done) {
  try {
    logDebug('deserializeUser user  ', id);
    let user = await DB.findUser({ _id: id }, null, null);
    if (user && user.length <= 0) {
      return done('user not found', false);
    }
    user = user[0];

    done(null, user);
  } catch (ex) {
    done(ex);
  }
});

module.exports = () => {
  console.log('Init passport');
  return _router;
};
