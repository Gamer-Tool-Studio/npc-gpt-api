import { Request, Response, Router } from 'express';
import mongoDB from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';
import config from 'src/config';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('metrics');

const router = Router();

/**
 * Debug endpoint to check auth and config
 * Remove this in production
 */
router.get('/debug-auth', async (req: Request, res: Response) => {
  try {
    res.json({
      user: req.user,
      adminEmail: config.ADMIN_EMAIL || process.env.ADMIN_EMAIL,
      envAdminEmail: process.env.ADMIN_EMAIL,
      configAdminEmail: config.ADMIN_EMAIL,
      match: req.user?.email === (config.ADMIN_EMAIL || process.env.ADMIN_EMAIL),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Get all platform metrics (admin only)
 * This endpoint is protected by admin email verification
 */
router.get('/admin/metrics', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      logError('Unauthorized metrics access attempt', { user: req.user });
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    logDebug('Fetching admin metrics...', { user: req.user });

    // Get time filter from query params (default: all time)
    const { timeFilter = 'all' } = req.query;
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (req.query.startDate) {
          startDate = new Date(req.query.startDate as string);
        }
        break;
      default:
        startDate = undefined; // All time
    }

    // Build date filter
    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    // 1. Total Users
    const allUsers = await mongoDB.find(DataBaseSchemas.USER, dateFilter, null, null);
    const totalUsers = allUsers.length;
    
    // 2. Total Organizations
    const allOrganizations = await mongoDB.find(DataBaseSchemas.ORGANIZATION, dateFilter, null, null);
    const totalOrganizations = allOrganizations.length;
    const freeTrialSubscriptions = allOrganizations.filter((org: any) => org.hasUsedFreeTrial).length;
    
    // 3. API Keys Generated (count tokens in all users)
    const totalApiKeys = allUsers.reduce((sum: number, user: any) => {
      return sum + (user.tokens?.length || 0);
    }, 0);
    
    // 4. Total API Calls (sum all billingDay records)
    const allBillingDays = await mongoDB.find(DataBaseSchemas.BILLING_DAY, dateFilter, null, null);
    const totalApiCalls = allBillingDays.length; // Each record represents API usage
    const totalInputTokens = allBillingDays.reduce((sum: number, record: any) => {
      return sum + (record.inputWords || 0);
    }, 0);
    const totalOutputTokens = allBillingDays.reduce((sum: number, record: any) => {
      return sum + (record.outputWords || 0);
    }, 0);
    const activeKeyWindowEnd = startDate ? new Date(startDate) : now;
    const activeKeyWindowStart = new Date(activeKeyWindowEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeKeyFilter: any = {
      createdAt: {
        $gte: activeKeyWindowStart,
      },
    };
    if (startDate) {
      activeKeyFilter.createdAt.$lt = startDate;
    }
    const activeKeyBillingDays = await mongoDB.find(
      DataBaseSchemas.BILLING_DAY,
      activeKeyFilter,
      null,
      null,
    );
    const activeApiKeys = activeKeyBillingDays.reduce((set: Set<string>, record: any) => {
      if (record.key) {
        set.add(record.key);
      }
      return set;
    }, new Set<string>()).size;
    
    // 5. Stripe Payments (checkout sessions) - filter by session creation date
    const allCheckouts = await mongoDB.find(DataBaseSchemas.CHECKOUT, {}, null, null);
    const filteredCheckouts = allCheckouts.map((checkout: any) => ({
      ...checkout,
      checkoutSessions: checkout.checkoutSessions?.filter((session: any) => {
        if (!startDate || !session.created) return true;
        const sessionDate = new Date(session.created * 1000);
        return sessionDate >= startDate;
      }) || []
    })).filter((checkout: any) => checkout.checkoutSessions.length > 0);
    
    const totalPayments = filteredCheckouts.reduce((sum: number, checkout: any) => {
      return sum + (checkout.checkoutSessions?.length || 0);
    }, 0);
    
    // Calculate total revenue (extract from checkout sessions)
    let totalRevenue = 0;
    filteredCheckouts.forEach((checkout: any) => {
      checkout.checkoutSessions?.forEach((session: any) => {
        if (session.amount_total) {
          totalRevenue += session.amount_total / 100; // Convert cents to dollars
        }
      });
    });
    
    // 6. Active Subscriptions (users with available tokens) - not filtered by time
    const allBilling = await mongoDB.find(DataBaseSchemas.BILLING, {}, null, null);
    const activeSubscriptions = allBilling.filter((billing: any) => {
      return billing.availableInputTokens > 0 || billing.availableOutputTokens > 0;
    }).length;
    
    // 7. Recent Signups (based on filter or last 30 days if "all")
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFilter = startDate ? dateFilter : { createdAt: { $gte: thirtyDaysAgo } };
    const recentUsers = await mongoDB.find(DataBaseSchemas.USER, recentFilter, null, null);
    const recentSignups = recentUsers.length;
    const newOrgWindowStart = startDate ?? thirtyDaysAgo;
    const newOrganizations = await mongoDB.find(
      DataBaseSchemas.ORGANIZATION,
      { createdAt: { $gte: newOrgWindowStart } },
      null,
      null,
    );
    const newOrganizationsCount = newOrganizations.length;
    
    // 8. Recent Payments (last 30 days)
    const recentCheckouts = allCheckouts.filter((checkout: any) => {
      return checkout.checkoutSessions?.some((session: any) => {
        if (!session.created) return false;
        const sessionDate = new Date(session.created * 1000);
        return sessionDate >= thirtyDaysAgo;
      });
    });
    let recentRevenue = 0;
    let recentPaymentCount = 0;
    recentCheckouts.forEach((checkout: any) => {
      checkout.checkoutSessions?.forEach((session: any) => {
        if (!session.created) return;
        const sessionDate = new Date(session.created * 1000);
        if (sessionDate >= thirtyDaysAgo) {
          recentPaymentCount++;
          if (session.amount_total) {
            recentRevenue += session.amount_total / 100;
          }
        }
      });
    });
    
    // 9. API Usage Over Time (last 30 days)
    const dailyUsage = await mongoDB.find(DataBaseSchemas.BILLING_DAY, {
      createdAt: { $gte: thirtyDaysAgo }
    }, null, null);
    
    const usageByDay = dailyUsage.reduce((acc: any, record: any) => {
      const date = new Date(record.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, calls: 0, inputTokens: 0, outputTokens: 0 };
      }
      acc[date].calls += 1;
      acc[date].inputTokens += record.inputWords || 0;
      acc[date].outputTokens += record.outputWords || 0;
      return acc;
    }, {});
    
    const usageTimeline = Object.values(usageByDay).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );

    logDebug('Metrics fetched successfully');

    res.json({
      overview: {
        totalUsers,
        totalOrganizations,
        totalApiKeys,
        activeApiKeys,
        activeSubscriptions,
        recentSignups,
        newOrganizations: newOrganizationsCount,
      },
      payments: {
        totalPayments,
        totalRevenue,
        recentPayments: recentPaymentCount,
        recentRevenue,
        freeTrialSubscriptions,
      },
      apiUsage: {
        totalCalls: totalApiCalls,
        totalInputTokens,
        totalOutputTokens,
        activeApiKeys,
        usageTimeline,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logError('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

/**
 * Get detailed user list
 */
router.get('/admin/users', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    const { timeFilter = 'all', startDate: customStart } = req.query;
    const dateFilter = getDateFilter(timeFilter as string, customStart as string);

    const users = await mongoDB.find(DataBaseSchemas.USER, dateFilter, null, { sort: { createdAt: -1 } });
    
    const userList = users.map((user: any) => ({
      id: user._id,
      email: user.email,
      name: user.name || user.username,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      role: user.role,
      apiKeys: user.tokens?.length || 0,
    }));

    res.json({ users: userList, total: userList.length });
  } catch (error) {
    logError('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

/**
 * Get detailed payment list
 */
router.get('/admin/payments', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    const { timeFilter = 'all', startDate: customStart } = req.query;
    const startDate = getDateFilterValue(timeFilter as string, customStart as string);

    const allCheckouts = await mongoDB.find(DataBaseSchemas.CHECKOUT, {}, null, null);
    
    const payments: any[] = [];
    allCheckouts.forEach((checkout: any) => {
      checkout.checkoutSessions?.forEach((session: any) => {
        if (!startDate || (session.created && new Date(session.created * 1000) >= startDate)) {
          payments.push({
            sessionId: session.id,
            customerEmail: session.customer_email || checkout.accountId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            status: session.payment_status,
            date: session.created ? new Date(session.created * 1000) : null,
            mode: session.mode,
          });
        }
      });
    });

    payments.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

    res.json({ payments, total: payments.length });
  } catch (error) {
    logError('Error fetching payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

/**
 * Get detailed organization list
 */
router.get('/admin/organizations', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    const { timeFilter = 'all', startDate: customStart } = req.query;
    const dateFilter = getDateFilter(timeFilter as string, customStart as string);

    const organizations = await mongoDB.find(DataBaseSchemas.ORGANIZATION, dateFilter, null, { sort: { createdAt: -1 } });
    
    const orgList = organizations.map((org: any) => ({
      id: org._id,
      name: org.name,
      orgId: org.orgId,
      memberCount: org.members?.length || 0,
      createdAt: org.createdAt,
    }));

    res.json({ organizations: orgList, total: orgList.length });
  } catch (error) {
    logError('Error fetching organizations:', error);
    res.status(500).json({ error: 'Error fetching organizations' });
  }
});

/**
 * Get detailed API usage list
 */
router.get('/admin/api-usage', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    const { timeFilter = 'all', startDate: customStart, limit = 100 } = req.query;
    const dateFilter = getDateFilter(timeFilter as string, customStart as string);

    const usageRecords = await mongoDB.find(
      DataBaseSchemas.BILLING_DAY, 
      dateFilter, 
      null, 
      { sort: { createdAt: -1 }, limit: parseInt(limit as string) }
    );
    
    const usageList = usageRecords.map((record: any) => ({
      id: record._id,
      accountId: record.accountId,
      inputTokens: record.inputWords || 0,
      outputTokens: record.outputWords || 0,
      date: record.createdAt,
      key: record.key,
    }));

    res.json({ usage: usageList, total: usageList.length });
  } catch (error) {
    logError('Error fetching API usage:', error);
    res.status(500).json({ error: 'Error fetching API usage' });
  }
});

/**
 * Get aggregated API usage grouped by organization, user, or API key
 */
router.get('/admin/api-usage-summary', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    const {
      timeFilter = 'all',
      startDate: customStart,
      groupBy = 'user',
    } = req.query as { timeFilter?: string; startDate?: string; groupBy?: string };

    const allowedGroupings = ['organization', 'user', 'key'];
    if (!allowedGroupings.includes(groupBy)) {
      return res.status(400).json({ error: 'Invalid groupBy parameter' });
    }

    const dateFilter = getDateFilter(timeFilter, customStart);

    const [usageRecords, users, organizations] = await Promise.all([
      mongoDB.find(DataBaseSchemas.BILLING_DAY, dateFilter, null, null),
      mongoDB.find(DataBaseSchemas.USER, {}, null, null),
      mongoDB.find(DataBaseSchemas.ORGANIZATION, {}, null, null),
    ]);

    const userMap = new Map<string, any>();
    users.forEach((user: any) => {
      userMap.set(user._id?.toString?.() || user.id, user);
    });

    const organizationMap = new Map<string, any>();
    organizations.forEach((org: any) => {
      organizationMap.set(org._id?.toString?.() || org.id, org);
    });

    type SummaryEntry = {
      id: string;
      label: string;
      secondaryLabel?: string;
      totalCalls: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      metadata?: Record<string, any>;
    };

    const summaryMap = new Map<string, SummaryEntry>();

    usageRecords.forEach((record: any) => {
      const accountId = record.accountId?.toString?.() || record.accountId;
      const key = record.key || 'unknown';

      let summaryKey = '';
      let label = '';
      let secondaryLabel: string | undefined;
      const metadata: Record<string, any> = {};

      if (groupBy === 'key') {
        summaryKey = key;
        label = key === 'unknown' ? 'Unknown Key' : key;
      const userForKey = accountId ? userMap.get(accountId) : null;
      const orgForKeyId = userForKey?.organization?.toString?.() || userForKey?.organization;
      const orgForKey = orgForKeyId ? organizationMap.get(orgForKeyId) : null;
      metadata.accountId = accountId;
      metadata.userEmail = userForKey?.email || '';
      metadata.organizationId = orgForKeyId;
      metadata.organizationName = orgForKey?.name || '';
      } else if (groupBy === 'user') {
        summaryKey = accountId || 'unknown';
        const user = accountId ? userMap.get(accountId) : null;
        label = user?.email || `User ${summaryKey}`;
        secondaryLabel = user?.name;
        metadata.organizationId = user?.organization?.toString?.() || user?.organization;
        metadata.organizationName = metadata.organizationId
          ? (organizationMap.get(metadata.organizationId)?.name || '')
          : '';
      } else if (groupBy === 'organization') {
        const user = accountId ? userMap.get(accountId) : null;
        const orgId = user?.organization?.toString?.() || user?.organization;
        summaryKey = orgId || 'no-organization';
        const org = orgId ? organizationMap.get(orgId) : null;
        label = org?.name || 'No Organization';
        metadata.organizationId = orgId;
        metadata.members = org?.members?.length || 0;
      }

      if (!summaryKey) {
        summaryKey = 'unknown';
        label = 'Unknown';
      }

      const entry = summaryMap.get(summaryKey) || {
        id: summaryKey,
        label,
        secondaryLabel,
        totalCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        metadata: {},
      };

      entry.totalCalls += 1;
      entry.totalInputTokens += record.inputWords || 0;
      entry.totalOutputTokens += record.outputWords || 0;

      entry.metadata = { ...entry.metadata, ...metadata };
      if (secondaryLabel) entry.secondaryLabel = secondaryLabel;

      summaryMap.set(summaryKey, entry);
    });

    const results = Array.from(summaryMap.values()).sort(
      (a, b) => b.totalCalls - a.totalCalls,
    );

    res.json({
      groupBy,
      timeFilter,
      results,
    });
  } catch (error) {
    logError('Error fetching API usage summary:', error);
    res.status(500).json({ error: 'Error fetching API usage summary' });
  }
});

/**
 * Get revenue and pack purchases grouped by organization
 */
router.get('/admin/revenue-summary', async (req: Request, res: Response) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized - Admin only' });
    }

    const { timeFilter = 'all', startDate: customStart } = req.query;
    const startDate = getDateFilterValue(timeFilter as string, customStart as string);

    const [organizations, users, checkouts] = await Promise.all([
      mongoDB.find(DataBaseSchemas.ORGANIZATION, {}, null, null),
      mongoDB.find(DataBaseSchemas.USER, {}, null, null),
      mongoDB.find(DataBaseSchemas.CHECKOUT, {}, null, null),
    ]);

    const organizationMap = new Map<string, any>();
    organizations.forEach((org: any) => {
      organizationMap.set(org._id?.toString?.() || org.id, org);
    });

    const userMap = new Map<string, any>();
    users.forEach((user: any) => {
      userMap.set(user._id?.toString?.() || user.id, user);
    });

    type PackSummary = {
      label: string;
      count: number;
    };

    type RevenueEntry = {
      orgId: string;
      orgName: string;
      members: number;
      totalRevenue: number;
      totalPayments: number;
      packs: Record<string, PackSummary>;
      hasUsedFreeTrial: boolean;
    };

    const revenueMap = new Map<string, RevenueEntry>();

    const priceToPlanMap: Record<string, { key: string; label: string }> = {};
    if (process.env.STRIPE_PRICE_SOLO_DEV) {
      priceToPlanMap[process.env.STRIPE_PRICE_SOLO_DEV] = { key: 'solo', label: 'Solo Dev' };
    }
    if (process.env.STRIPE_PRICE_INDIE_STUDIO) {
      priceToPlanMap[process.env.STRIPE_PRICE_INDIE_STUDIO] = { key: 'indie', label: 'Indie Studio' };
    }
    if (process.env.STRIPE_PRICE_ENTERPRISE) {
      priceToPlanMap[process.env.STRIPE_PRICE_ENTERPRISE] = { key: 'enterprise', label: 'Enterprise' };
    }

    const incrementPack = (entry: RevenueEntry, planKey: string, label: string) => {
      if (!entry.packs[planKey]) {
        entry.packs[planKey] = { label, count: 0 };
      }
      entry.packs[planKey].count += 1;
    };

    checkouts.forEach((checkout: any) => {
      const accountId = checkout.accountId?.toString?.() || checkout.accountId;
      const user = accountId ? userMap.get(accountId) : null;
      const orgId = user?.organization?.toString?.() || user?.organization;
      const org = orgId ? organizationMap.get(orgId) : null;

      const entryKey = orgId || 'no-organization';

      const entry =
        revenueMap.get(entryKey) ||
        {
          orgId: orgId || 'no-organization',
          orgName: org?.name || (orgId ? `Org ${orgId}` : 'No Organization'),
          members: org?.members?.length || 0,
          totalRevenue: 0,
          totalPayments: 0,
          packs: {},
          hasUsedFreeTrial: org?.hasUsedFreeTrial || false,
        };

      checkout.checkoutSessions?.forEach((session: any) => {
        if (!session.created) return;
        const sessionDate = new Date(session.created * 1000);
        if (startDate && sessionDate < startDate) return;

        const amount = session.amount_total ? session.amount_total / 100 : 0;
        entry.totalRevenue += amount;
        entry.totalPayments += 1;

        const priceId =
          session.metadata?.price_id ||
          session.price?.id ||
          session.display_items?.[0]?.price?.id ||
          '';

        const plan =
          (priceId && priceToPlanMap[priceId]) || { key: 'unknown', label: 'Unknown Pack' };

        incrementPack(entry, plan.key, plan.label);
      });

      revenueMap.set(entryKey, entry);
    });

    // Ensure free trial flag is represented as a pack entry
    revenueMap.forEach((entry) => {
      if (entry.hasUsedFreeTrial) {
        incrementPack(entry, 'freeTrial', 'Free Trial');
      }
    });

    const results = Array.from(revenueMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    res.json({
      timeFilter,
      results,
    });
  } catch (error) {
    logError('Error fetching revenue summary:', error);
    res.status(500).json({ error: 'Error fetching revenue summary' });
  }
});

// Helper function to get date filter
function getDateFilter(timeFilter: string, customStart?: string) {
  const startDate = getDateFilterValue(timeFilter, customStart);
  return startDate ? { createdAt: { $gte: startDate } } : {};
}

function getDateFilterValue(timeFilter: string, customStart?: string): Date | undefined {
  const now = new Date();
  switch (timeFilter) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'custom':
      return customStart ? new Date(customStart) : undefined;
    default:
      return undefined;
  }
}

function isAdminRequest(req: Request): boolean {
  const user = req.user as any;
  const userEmail = user?.email;
  const userRole = user?.role;
  const ADMIN_EMAIL = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL;

  if (userRole === 'admin') {
    return true;
  }

  if (ADMIN_EMAIL && userEmail === ADMIN_EMAIL) {
    return true;
  }

  return false;
}

export default router;

