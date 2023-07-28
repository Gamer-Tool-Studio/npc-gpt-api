import { authLogin } from "~/services/auth";

const { logDebug, logError } =
  require("src/core-services/logFunctionFactory").getLogger("chat");

const { Router } = require("express");

const router = Router();

router.post("/gen-auth", async (request, response) => {
  try {
    console.log(" **** Auth token route **** ");
    console.log(
      " **** locals ",
      response.locals.username,
      " auth token ",
      response.locals.authToken
    );

    response
      .status(200)
      .json({
        token: response.locals.authToken,
        username: response.locals.username,
      });
  } catch (ex) {
    logError("get todo ", ex);
    response.status(500).json({ error: ex });
  }
});

module.exports = router;
