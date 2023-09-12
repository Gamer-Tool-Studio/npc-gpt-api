
import { Router, Request, Response } from 'express';
const { authLogin, createAccount, registerUser } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('auth');
const router = Router();

  
/**
 *  Login profile
 */
router.get('/profile', (req,res) => {
    // Work
    res.json({message : 'its okay', user : req.user });
});


export default router;