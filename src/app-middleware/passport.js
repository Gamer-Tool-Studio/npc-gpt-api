const { Router } = require('express');
const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('passport');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DB = require('src/database');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK } = require('~/config');

const router = Router();
router.use(passport.initialize());
router.use(passport.session());

// google strategy
// http://localhost:3002/api/v1/auth/google/login
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK, // Replace with your callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { ...profile, strategy: 'google' });
    },
  ),
);

// local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        logDebug('username: ', username);
        logDebug('password: ', password);
        const user = (await DB.findUser({ username }, null, null))?.[0];

        if (user && user.length <= 0) {
          return done(null, false);
        }

        if (!user.verifyPassword(password)) {
          return done(null, false);
        }
        logDebug('ok!! ', done);

        return done(null, { ...user, strategy: 'local' });
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  logDebug('serialize user  ');
  if (user.strategy === 'google') {
    logDebug('GOOGLE USER  ############ ');
  } else if (user.strategy === 'local') {
    logDebug('LOCAL USER  ############ ');
  }
  done(null, user);
  // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(async (user, done) => {
  try {
    logDebug('deserializeUser user  ', user);
    // let user = await DB.findUser({ _id: id }, null, null);
    // if (user && user.length <= 0) {
    //   return done('user not found', false);
    // // }
    // user = user[0];

    done(null, user);
  } catch (ex) {
    done(ex);
  }
});

module.exports = () => {
  return router;
};
