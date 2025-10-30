import DB from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';

const bcrypt = require('bcryptjs');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:user-initialization');

interface UserInitializationData {
  username?: string;
  email: string;
  password?: string;
  name?: string;
  picture?: string;
  sub?: string; // SSO provider ID
}

interface BillingDefaults {
  availableInputTokens: number;
  availableOutputTokens: number;
}

const DEFAULT_FREE_TOKENS: BillingDefaults = {
  availableInputTokens: 5000,
  availableOutputTokens: 5000,
};

/**
 * Unified user initialization for both manual and SSO registration
 * Handles user creation, organization creation, billing setup, and all necessary initialization
 */
export async function initializeUser(
  data: UserInitializationData,
  authProvider: 'local' | 'hellocoop' | 'google',
  billingDefaults: BillingDefaults = DEFAULT_FREE_TOKENS,
) {
  logDebug('🚀 Initializing new user & organization', { email: data.email, authProvider });

  try {
    // 1. Check if user already exists
    const existingUser = await DB.findSingleUser({ email: data.email });
    if (existingUser) {
      logDebug('❌ User already exists:', data.email);
      throw new Error('User already exists with this email');
    }

    // 2. Create organization first (org-first architecture)
    const orgName = data.name || data.email.split('@')[0] + "'s Organization";
    logDebug('🏢 Creating organization:', orgName);
    const organization = await createOrganization(orgName);
    logDebug('✅ Organization created:', organization.orgId);

    // 3. Prepare user data based on auth provider
    const userData: any = {
      email: data.email,
      username: data.username || data.email.split('@')[0],
      name: data.name || data.username || data.email.split('@')[0],
      picture: data.picture || null,
      authProvider,
      authProviderId: data.sub || null,
      passwordRequired: authProvider === 'local',
      emailVerified: authProvider !== 'local', // SSO emails are pre-verified
      type: 'user', // Default user type
      role: 'admin', // First user is always admin
      organization: organization._id, // Link to organization
    };

    // 4. Handle password based on auth method
    if (authProvider === 'local') {
      if (!data.password) {
        throw new Error('Password is required for local registration');
      }
      userData.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10), null);
    } else {
      // SSO users don't need passwords
      userData.password = null;
      userData.ext_id = data.sub; // Store provider ID
    }

    // 5. Create user in database
    logDebug('📝 Creating user in database...');
    const user = await DB.registerUser(userData);
    logDebug('✅ User created:', user.email);

    const userId = user.id || user._id.toString();

    // 6. Update organization with owner and first member
    logDebug('🔗 Linking user to organization...');
    await DB.UpdateOneOrganization(
      { _id: organization._id },
      {
        $set: { ownerId: user._id },
        $push: { members: user._id },
      }
    );
    logDebug('✅ User linked to organization');

    // 7. Initialize billing account (org-level billing)
    logDebug('💰 Creating billing account...');
    await createBillingAccount(userId, billingDefaults);
    logDebug('✅ Billing account created');

    // 8. Log registration event
    logDebug('✨ User & Organization initialization complete', {
      userId,
      email: user.email,
      orgId: organization.orgId,
      authProvider,
    });

    return user;
  } catch (error: any) {
    logError('❌ User initialization failed', error);
    throw error;
  }
}

/**
 * Creates a billing account for a new user with default token allocation
 */
async function createBillingAccount(accountId: string, tokens: BillingDefaults) {
  try {
    const billingData = {
      accountId,
      inputWords: 0,
      outputWords: 0,
      availableInputTokens: tokens.availableInputTokens,
      availableOutputTokens: tokens.availableOutputTokens,
    };

    const billing = await DB.findOneAndUpdate(
      DataBaseSchemas.BILLING,
      { accountId },
      billingData,
      { upsert: true, new: true },
    );

    logDebug('Billing account created/updated:', billing);
    return billing;
  } catch (error) {
    logError('Error creating billing account:', error);
    throw error;
  }
}

/**
 * Helper to check if a user can authenticate with SSO
 * Allows linking SSO to existing local accounts
 */
export async function linkOrCreateSSOUser(
  ssoData: { email: string; name?: string; picture?: string; sub: string },
  authProvider: 'hellocoop' | 'google',
) {
  logDebug('🔗 Link or create SSO user:', ssoData.email);

  try {
    // Check if user exists with this email
    let user = await DB.findSingleUser({ email: ssoData.email });

    if (user) {
      // User exists - update with SSO data if not already linked
      if (!user.authProviderId || user.authProviderId !== ssoData.sub) {
        logDebug('🔄 Linking SSO to existing account:', user.email);
        
        const updateData: any = {
          authProviderId: ssoData.sub,
          emailVerified: true, // SSO verified the email
        };
        
        // Update picture and name if not set
        if (!user.picture && ssoData.picture) {
          updateData.picture = ssoData.picture;
        }
        if (!user.name && ssoData.name) {
          updateData.name = ssoData.name;
        }
        
        user = await DB.UpdateOneUser(
          { _id: user._id || user.id },
          { $set: updateData },
        );
        
        logDebug('✅ SSO linked to existing account');
      }
    } else {
      // User doesn't exist - create new user
      logDebug('✨ Creating new user via SSO');
      user = await initializeUser(
        {
          email: ssoData.email,
          name: ssoData.name,
          picture: ssoData.picture,
          sub: ssoData.sub,
        },
        authProvider,
      );
    }

    return user;
  } catch (error) {
    logError('Error in linkOrCreateSSOUser:', error);
    throw error;
  }
}

/**
 * Creates a new organization for a new user
 */
async function createOrganization(name: string) {
  const crypto = require('crypto');
  
  try {
    const orgId = 'org_' + crypto.randomBytes(12).toString('hex'); // Generate org_xxxxx ID
    
    const orgData = {
      name,
      orgId,
      members: [], // Will be populated after user is created
      ownerId: null, // Will be set after user is created
    };

    const organization = await DB.createOrganization(orgData);
    logDebug('Organization created:', { orgId: organization.orgId, name: organization.name });
    
    return organization;
  } catch (error) {
    logError('Error creating organization:', error);
    throw error;
  }
}

export { createBillingAccount, createOrganization, DEFAULT_FREE_TOKENS };

