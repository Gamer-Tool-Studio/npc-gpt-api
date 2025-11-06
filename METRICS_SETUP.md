# Metrics Dashboard Setup Guide

## Overview
The metrics dashboard provides a comprehensive view of your platform's key performance indicators (KPIs) including user signups, API usage, payments, and more.

## Features

The metrics dashboard tracks:
- ✅ **Total Users** - All registered users
- ✅ **Organizations Signed Up** - Total organizations created
- ✅ **API Keys Generated** - Number of API keys created by users
- ✅ **API Calls** - Total number of API requests made
- ✅ **Stripe Subscriptions** - Active users with token balance
- ✅ **Payments** - Total and recent payment transactions
- ✅ **Revenue** - Total and recent revenue (last 30 days)
- ✅ **API Usage Timeline** - Daily usage breakdown for the last 30 days
- ✅ **Visits to Website** - (Can be integrated with Google Analytics)

## Setup Instructions

### 1. Configure Admin Email

Add your admin email address to your environment configuration:

**Development (.env.development or .env):**
```bash
ADMIN_EMAIL=your-admin-email@example.com
```

**Production (.env.production):**
```bash
ADMIN_EMAIL=your-admin-email@example.com
```

⚠️ **Security Note**: Only the email specified in `ADMIN_EMAIL` will have access to the metrics endpoint. This is enforced on the backend.

### 2. Restart the API Server

After adding the environment variable, restart your API server:

```bash
# Development
npm run dev

# Production
npm run prod
```

### 3. Access the Metrics Dashboard

Navigate to the metrics page in your browser:

**Development:**
```
http://localhost:3001/metrics
```

**Production:**
```
https://your-domain.com/metrics
```

## API Endpoint

The metrics data is served by the backend API:

**Endpoint:** `GET /api/v1/metrics/admin/metrics`

**Authentication:** Requires valid JWT token and admin email verification

**Response Format:**
```json
{
  "overview": {
    "totalUsers": 150,
    "totalOrganizations": 45,
    "totalApiKeys": 89,
    "activeSubscriptions": 32,
    "recentSignups": 12
  },
  "payments": {
    "totalPayments": 67,
    "totalRevenue": 3450.00,
    "recentPayments": 8,
    "recentRevenue": 540.00
  },
  "apiUsage": {
    "totalCalls": 12450,
    "totalInputTokens": 2500000,
    "totalOutputTokens": 1000000,
    "usageTimeline": [
      {
        "date": "2025-11-01",
        "calls": 150,
        "inputTokens": 30000,
        "outputTokens": 12000
      }
    ]
  },
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

## Security Considerations

1. **Admin-Only Access**: The endpoint verifies that the authenticated user's email matches the `ADMIN_EMAIL` environment variable
2. **Authentication Required**: Users must be logged in with a valid JWT token
3. **Hidden Route**: The `/metrics` page is not linked in the navigation - access is only by direct URL
4. **Environment-Based**: Admin email is configured per environment (dev/prod)

## Troubleshooting

### "Unauthorized - Admin only" Error
- **Cause**: Your logged-in email doesn't match the `ADMIN_EMAIL` environment variable
- **Solution**: 
  1. Check that `ADMIN_EMAIL` is set correctly in your `.env` file
  2. Make sure you're logged in with the admin email account
  3. Restart the API server after changing the environment variable

### "Server configuration error"
- **Cause**: `ADMIN_EMAIL` environment variable is not set
- **Solution**: Add `ADMIN_EMAIL=your-email@example.com` to your `.env` file and restart the server

### Metrics Show Zero Values
- **Cause**: No data in the database yet, or database connection issues
- **Solution**: 
  1. Verify MongoDB connection is working
  2. Check that you have users/organizations/API usage in the database
  3. Check API server logs for any database errors

## Future Enhancements

Potential additions to the metrics dashboard:

1. **Google Analytics Integration** - Track website visits and user behavior
2. **Export to CSV** - Download metrics data for external analysis
3. **Date Range Filters** - View metrics for custom time periods
4. **Email Reports** - Automated weekly/monthly metric summaries
5. **Real-time Updates** - WebSocket-based live metrics
6. **Comparison Charts** - Month-over-month growth comparisons
7. **User Segmentation** - Breakdown by plan type, region, etc.

## Support

If you encounter any issues with the metrics dashboard, check:
1. Backend API logs for errors
2. Browser console for frontend errors
3. Database connectivity
4. Environment variable configuration

---

**Last Updated:** November 6, 2025

