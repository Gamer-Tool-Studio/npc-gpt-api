"use strict";
// eslint-disable-next-line arrow-body-style

const logError = console.log;

const authLogin = async function (data) {
  console.log("********* authenticator route **********", data);

  try {
    return { authToken: "0x13124124343" };
  } catch (ex) {
    logError("Error validating data ", ex);
    throw ex;
  }
};

module.exports = { authLogin };
