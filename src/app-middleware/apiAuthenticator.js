"use strict";

const { Router } = require("express");
const logDebug = require("$core-services/logFunctionFactory").getDebugLogger();
const logError = require("$core-services/logFunctionFactory").getErrorLogger();
const challenges = require("$services/challenges");

/**
 * Routes that uses authentications
 */
const authRoutes = ["/api/test"];

const signValidatorHandler = async function (req, response, next) {
  logDebug(
    "API AUTHENTICATOR\n",
    "URL : ",
    req.originalUrl,
    " METHOD ",
    req.method
  );

  const calledUrl = req.originalUrl.split("?")[0];

  if (authRoutes.includes(calledUrl)) {
    try {
      const authToken = req.header("WalliD-Authorization") || null;
      logDebug("AuthToken in header: ", authToken);

      if (!authToken) {
        logDebug(
          "Missing authorization token in header 'WalliD-Authorization'"
        );

        let err = new Error("Unauthorized");
        err.status = 401;

        next(err);
      } else {
        let checkSign = await challenges.checkSignToken(authToken);
        logDebug("CHECKSIGN ", checkSign);

        if (checkSign.valid) {
          logDebug(
            "Authorization token is valid and was signed by ",
            checkSign.user_wallet
          );
          response.locals = {
            user_wallet: checkSign.user_wallet,
          };
          next();
        } else {
          let err = new Error("Forbidden");
          err.status = 403;
          next(err);
        }
      }
    } catch (error) {
      logError("Error in middlware ", error);
      const err = new Error("Internal server error");
      err.status = 500;
      next(err);
    }
  } else {
    logDebug("Bypassing authorization for url: ", calledUrl);
    next();
  }
};

module.exports = function () {
  return Router().use("/api", signValidatorHandler);
};
