import { Router, Request, Response } from 'express';
import parameterValidator from 'src/core-services/parameterValidator';
import passport from 'passport'
const { authLogin, createAccount, registerUser } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('auth');
const router = Router();

router.get('/google', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Auth token route **** ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    res.json({
      token: res.locals.authToken,
      username: res.locals.username,
    });
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});


router.post('/register', async (req: Request, res: Response) => {
  try {
    logDebug(' **** register route **** ');

    const params = ['username', 'password', 'email'];
    parameterValidator(req.body, params);

    let newUser = await registerUser(req.body);
    res.json(newUser);
  } catch (ex) {
    logError('issue register new user ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post(
  '/login',
  passport.authenticate("local"),
  function(req : Request, res : Response) {
     res.json(req.user);
  }
);

function isLoggedIn(req: Request, res: Response,  done: any) {
  
  if (req.isAuthenticated()) {
     return done();
  }
  
  return  res.status(401).json({ message : "not logged" });
};

router.get('/profile',isLoggedIn, (req,res) => {
 
  // Work
  res.json({message : 'its okay', user : req.user });
});

router.post('/gen-auth', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Auth token route **** ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    res.json({
      token: res.locals.authToken,
      username: res.locals.username,
    });
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

// router.post('/login', async (req: Request, res: Response) => {
//   try {
//     logDebug(' **** login **** ');

//     logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

//     const authToken = await authLogin();

//     res.status(200).json({
//       token: authToken,
//     });
//   } catch (ex) {
//     logError('login error ', ex);
//     res.status(500).json({ error: ex });
//   }
// });

router.post('/reset-secret', async (req: Request, res: Response) => {
  try {
    logDebug(' **** reset-secret **** route ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    res.status(200).json({
      token: res.locals.authToken,
      username: res.locals.username,
    });
  } catch (ex) {
    logError('get todo ', ex);
    res.status(500).json({ error: ex });
  }
});

router.post('/create-account', async (req: Request, res: Response) => {
  try {
    logDebug(' **** reset-secret **** route ');

    logDebug(' **** locals ', res.locals.username, ' auth token ', res.locals.authToken);

    const a = await createAccount(req.body);
    res.status(200).json({ newAccount: a });
  } catch (ex) {
    logError('create-account log error ', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
