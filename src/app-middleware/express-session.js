const { Router } = require('express');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('express-session');
const session = require('express-session');

//https://stackoverflow.com/questions/61947869/how-does-passportjs-deal-with-session-cookies

let sess = {
  secret: 'your secret line of secretness',
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

module.exports = () => {
  console.log('Session its active .....');
  return Router().use(session(sess));
};
