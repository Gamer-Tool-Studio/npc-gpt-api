import { Router, Request, Response } from 'express';
import { filterObject } from 'src/lib/util';
import { checkBalance } from 'src/services/billing';
import { TokenEntry } from 'src/types/auth';

import DB from 'src/database';

const { mapGoogleToProfile } = require('src/lib/util');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('user');

const router = Router();

/**
 * Get user Balance
 */
router.get('/balance', async (req: Request, res: Response) => {
  logDebug('Route /balance', req.user);

  try {
    const userBalance = await checkBalance(req.user?.id);
    res.send(userBalance);
  } catch (error) {
    logError(error);
  }
});

/**
 *  User profile with organization data
 */
router.get('/profile', async (req: Request, res: Response) => {
  logDebug('Route /profile', req.user);
  let mappedUser;

  const { strategy } = req.user as unknown as { strategy: string };
  logDebug('strategy', strategy);

  const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
  logDebug('db user', user);

  try {
    // Get organization data
    const organization = user.organization ? await DB.findOrganizationById(user.organization) : null;
    logDebug('organization', organization);

    switch (strategy) {
      case 'google':
        mappedUser = mapGoogleToProfile(req.user);
        break;
      case 'local':
      case 'jwt': {
        const filter = ['id', 'username', 'email', 'name', 'picture', 'role', 'tokens'];
        const userFiltered = filterObject(user.toJSON() as unknown as Record<string, unknown>, filter);
        mappedUser = { ...userFiltered };

        const tokens = mappedUser.tokens as TokenEntry[];
        // eslint-disable-next-line object-curly-newline
        mappedUser.keys = tokens.map(({ id, name, lastUsed, dateCreated, token }: TokenEntry) => ({
          id,
          name,
          key: `${token?.slice(0, 12)}...`,
          dateCreated,
          lastUsed: lastUsed || 'Not used',
        }));
        delete mappedUser.tokens;

        break;
      }

      default:
        break;
    }

    // Add organization data to response
    const response: any = { ...mappedUser };
    if (organization) {
      response.organization = {
        id: organization._id.toString(),
        name: organization.name,
        orgId: organization.orgId,
        ownerId: organization.ownerId?.toString(),
        isOwner: user._id.toString() === organization.ownerId?.toString(),
        memberCount: organization.members?.length || 0,
      };
    }

    res.json(response);
  } catch (error) {
    logError(error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

/**
 * Get organization members
 */
router.get('/organization/members', async (req: Request, res: Response) => {
  try {
    const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
    if (!user || !user.organization) {
      logError('User or organization not found', { userId: req.user?.id, hasOrg: !!user?.organization });
      return res.status(404).json({ error: 'Organization not found' });
    }

    logDebug('Fetching organization:', user.organization);
    const organization = await DB.findOrganizationById(user.organization);
    if (!organization) {
      logError('Organization not found in DB', { orgId: user.organization });
      return res.status(404).json({ error: 'Organization not found' });
    }

    logDebug('Organization found:', { 
      orgId: organization.orgId, 
      name: organization.name,
      membersCount: organization.members?.length,
      membersRaw: organization.members 
    });

    // Filter member data to return only necessary fields
    const members = organization.members?.map((member: any) => ({
      id: member._id.toString(),
      username: member.username,
      email: member.email,
      name: member.name,
      picture: member.picture,
      role: member.role,
    })) || [];

    logDebug('Mapped members:', members);

    res.json({ members, orgId: organization.orgId, orgName: organization.name });
  } catch (error) {
    logError('Error fetching organization members:', error);
    res.status(500).json({ error: 'Error fetching members' });
  }
});

/**
 * Update organization name (admin only)
 */
router.patch('/organization/name', async (req: Request, res: Response) => {
  try {
    const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
    if (!user || !user.organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update organization name' });
    }

    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    await DB.UpdateOneOrganization(
      { _id: user.organization },
      { $set: { name: name.trim() } }
    );

    res.json({ success: true, name: name.trim() });
  } catch (error) {
    logError('Error updating organization name:', error);
    res.status(500).json({ error: 'Error updating organization name' });
  }
});

/**
 * Get user's API usage statistics
 */
router.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all API tokens for this user
    const tokens = await DB.findTokens({ owner: userId });
    const tokenIds = tokens.map((token: any) => token._id);

    // Get usage data for all user's tokens
    const usageRecords = await DB.findManyUsage({ token: { $in: tokenIds } });

    // Calculate totals
    const totalCalls = usageRecords.length;
    const totalInputTokens = usageRecords.reduce((sum: number, record: any) => sum + (record.inputWords || 0), 0);
    const totalOutputTokens = usageRecords.reduce((sum: number, record: any) => sum + (record.outputWords || 0), 0);

    res.json({
      totalCalls,
      totalInputTokens,
      totalOutputTokens,
    });
  } catch (error) {
    logError('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Error fetching usage statistics' });
  }
});

/**
 * Update user profile (name)
 */
router.patch('/update-profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await DB.UpdateOneUser(
      { _id: userId },
      { $set: { name: name.trim() } }
    );

    res.json({ success: true, name: name.trim() });
  } catch (error) {
    logError('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

/**
 * Update user profile picture
 */
router.patch('/update-picture', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { picture } = req.body;
    if (!picture || typeof picture !== 'string') {
      return res.status(400).json({ error: 'Picture data is required' });
    }

    // Validate base64 image
    if (!picture.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    await DB.UpdateOneUser(
      { _id: userId },
      { $set: { picture } }
    );

    res.json({ success: true, picture });
  } catch (error) {
    logError('Error updating profile picture:', error);
    res.status(500).json({ error: 'Error updating profile picture' });
  }
});

/**
 * Update member role (admin only)
 */
router.patch('/organization/members/:memberId/role', async (req: Request, res: Response) => {
  try {
    const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
    if (!user || !user.organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change member roles' });
    }

    const { memberId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || (role !== 'admin' && role !== 'user')) {
      return res.status(400).json({ error: 'Invalid role. Must be "admin" or "user".' });
    }

    // Prevent changing your own role
    if (memberId === user._id.toString() || memberId === user.id) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    // Check if the member exists and is part of this organization
    const memberToUpdate = await DB.findSingleUser({ _id: memberId }, null, null);
    if (!memberToUpdate || memberToUpdate.organization.toString() !== user.organization.toString()) {
      return res.status(404).json({ error: 'Member not found in this organization' });
    }

    // Update member role
    await DB.UpdateOneUser(
      { _id: memberId },
      { $set: { role } }
    );

    logDebug('Member role updated:', { memberId, newRole: role, organizationId: user.organization });

    res.json({ success: true, role, message: 'Member role updated successfully' });
  } catch (error) {
    logError('Error updating member role:', error);
    res.status(500).json({ error: 'Error updating member role' });
  }
});

/**
 * Remove member from organization (admin only)
 */
router.delete('/organization/members/:memberId', async (req: Request, res: Response) => {
  try {
    const user = await DB.findSingleUser({ _id: req.user?.id }, null, null);
    if (!user || !user.organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    const { memberId } = req.params;

    // Prevent removing yourself
    if (memberId === user._id.toString() || memberId === user.id) {
      return res.status(400).json({ error: 'You cannot remove yourself from the organization' });
    }

    // Check if the member exists and is part of this organization
    const memberToRemove = await DB.findSingleUser({ _id: memberId }, null, null);
    if (!memberToRemove || memberToRemove.organization.toString() !== user.organization.toString()) {
      return res.status(404).json({ error: 'Member not found in this organization' });
    }

    // Remove member from organization
    await DB.UpdateOneOrganization(
      { _id: user.organization },
      { $pull: { members: memberId } }
    );

    logDebug('Member removed from organization:', { memberId, organizationId: user.organization });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    logError('Error removing member:', error);
    res.status(500).json({ error: 'Error removing member' });
  }
});

export default router;
