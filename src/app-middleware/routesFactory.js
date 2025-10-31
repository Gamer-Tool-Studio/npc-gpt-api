const { Router } = require('express');
const routes = require('src/router');

const router = Router();
async function loadAssetsRoutes() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  router.use('/assets', await require('src/router/cluaido').default);
}

loadAssetsRoutes();
router.use('/api/v1', routes);

// Hello.coop callback route (outside /api/v1 to match console config)
const { filterObject } = require('src/lib/util');
const { issueTokenForUser } = require('src/services/auth');
const DB = require('src/database').default;

router.post('/auth/hello/callback', async (req, res) => {
  const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:hello');
  const config = require('src/config').default;
  const { FRONTEND_URL } = config;
  const { linkOrCreateSSOUser } = require('src/services/user-initialization');
  
  try {
    logDebug('📥 Hello.coop callback hit', req.body);
    logDebug('📍 FRONTEND_URL:', FRONTEND_URL);
    
    const { code, id_token, state } = req.body;
    
    if (!code && !id_token) {
      logDebug('❌ No code or id_token, redirecting to login');
      return res.redirect(`${FRONTEND_URL}/login?error=Authentication failed`);
    }
    
    // Decode the id_token to get user info
    const payload = id_token ? JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString()) : null;
    
    if (!payload || !payload.email) {
      logDebug('❌ Invalid payload or no email');
      return res.redirect(`${FRONTEND_URL}/login?error=Invalid token`);
    }
    
    const { sub, email, name, picture } = payload;
    logDebug('👤 User from Hello.coop:', { sub, email, name });
    
    // Use unified SSO user creation/linking
    const user = await linkOrCreateSSOUser(
      { email, name, picture, sub },
      'hellocoop'
    );
    
    logDebug('✅ User ready:', user.email);
    
    const filter = ['id', 'username', 'email', 'name', 'picture'];
    const userFiltered = filterObject(user.toJSON ? user.toJSON() : user, filter);
    
    const tokenObject = await issueTokenForUser(userFiltered);
    logDebug('🔑 Token issued:', tokenObject.token.substring(0, 20) + '...');
    
    // Build redirect URL - encode state to preserve query params
    const stateParam = encodeURIComponent(state || '/dashboard');
    const redirectUrl = `${FRONTEND_URL}/auth/hello/callback?token=${tokenObject.token}&state=${stateParam}`;
    logDebug('🔄 Redirecting to:', redirectUrl);
    
    // Redirect back to frontend with token
    return res.redirect(302, redirectUrl);
  } catch (error) {
    logError('❌ Hello.coop callback error', error);
    const errorMsg = encodeURIComponent(error?.message || 'Authentication failed');
    return res.redirect(302, `${FRONTEND_URL}/login?error=${errorMsg}`);
  }
});

module.exports = function routesFactory() {
  return router;
};
