"use strict";

const { Router } = require("express");
const logDebug = require("$core-services/logFunctionFactory").getDebugLogger();
const logError = require("$core-services/logFunctionFactory").getErrorLogger();
const challenges = require("$services/challenges");

/**
 * Routes that uses authentications
 */
const authRoutes = ["/api/gen-auth"];

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
      const authToken = req.header("Barear") || null;
      logDebug("AuthToken in header: ", authToken);

      if (!authToken) {
        logDebug(
          "Missing authorization token in header 'WalliD-Authorization'"
        );

        let err = new Error("Unauthorized");
        err.status = 401;
        next(err);
      } else {
        console.log("check if token is valid and billing its OK");
        next();
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
