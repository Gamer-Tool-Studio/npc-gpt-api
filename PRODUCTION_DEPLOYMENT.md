# 🚀 Production Deployment Checklist for NPC-GPT B2B SaaS

## 📋 Quick Overview

Your platform is ready for production! Here's what we've built:
- ✅ B2B SaaS with organization-first architecture
- ✅ Role-based access control (Admin/User)
- ✅ Stripe one-time payment integration
- ✅ Hello.coop SSO authentication
- ✅ API key management per user
- ✅ Token-based billing system
- ✅ NPC chat API with OpenAI

---

## 🔴 CRITICAL: What You Need Before Deploying

### 1. **Your Production Domains**
- Frontend domain (e.g., `https://gamertoolstudio.com`)
- Backend API domain (e.g., `https://api.gamertoolstudio.com`)

### 2. **Stripe Live Mode**
- Switch to Live mode in Stripe Dashboard
- Create production products/prices
- Get live API keys

### 3. **Production Database**
- MongoDB production cluster (separate from dev)

---

## 📋 Pre-Deployment Steps

### 1. Backend Environment Variables

**Copy your `.env.development` to `.env.production` and update these values:**

#### **Required Production Settings:**

```bash
# Environment
NODE_ENV=production

# Server
PORT=3002
DOMAIN_ENV=production

# Database
DB_HOST=mongodb+srv://YOUR_PRODUCTION_MONGO_URI
DB_USER=your_production_db_user
DB_PASS=your_production_db_password
DB_NAME=gts-db-production

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Auth & Security
TOKEN_SECRET=your_production_secret_here
ALLOW_REGISTER=true

# Hello.coop (Update callback URL in Hello.coop dashboard)
HELLO_CLIENT_ID=your_hello_client_id
HELLO_CLIENT_SECRET=your_hello_client_secret
HELLO_REDIRECT_URI=https://api.yourdomain.com/auth/hello/callback

# OpenAI
OPENAI_API_KEY=sk-your-production-openai-key
OPENAI_GPT_MODEL=gpt-4o-mini

# Redis
USE_REDIS=true
REDIS_URL=your_production_redis_url

# Stripe PRODUCTION Keys (⚠️ NOT test keys!)
STRIPE_SECRET_KEY=sk_live_YOUR_PRODUCTION_KEY
STRIPE_PAYMENT_METHODS_TYPES=card
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

# Stripe PRODUCTION Price IDs
STRIPE_PRICE_SOLO_DEV=price_YOUR_PRODUCTION_SOLO_DEV_PRICE
STRIPE_PRICE_INDIE_STUDIO=price_YOUR_PRODUCTION_INDIE_STUDIO_PRICE
STRIPE_PRICE_ENTERPRISE=price_YOUR_PRODUCTION_ENTERPRISE_PRICE

# CORS
ENABLE_CORS=true
ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_HEADERS=Content-Type,Authorization
```

---

### 2. Stripe Production Setup

#### **A. Switch to Live Mode in Stripe Dashboard**
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
2. Go to **Products** and verify all 3 products exist with correct pricing:
   - Solo Dev: $9 (one-time)
   - Indie Studio: $59 (one-time)
   - Enterprise: $259 (one-time)

#### **B. Get Production Price IDs**
1. Click on each product
2. Copy the **API ID** (e.g., `price_xxxxxxxxxxxxx`)
3. Update in `.env.production`:
   ```bash
   STRIPE_PRICE_SOLO_DEV=price_your_actual_solo_dev_id
   STRIPE_PRICE_INDIE_STUDIO=price_your_actual_indie_studio_id
   STRIPE_PRICE_ENTERPRISE=price_your_actual_enterprise_id
   ```

#### **C. Get Production API Keys**
1. Go to: https://dashboard.stripe.com/apikeys (Live mode)
2. Copy **Secret key** → Update `STRIPE_SECRET_KEY` in `.env.production`
3. Copy **Publishable key** (if needed for frontend)

#### **D. Configure Webhook**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://api.yourdomain.com/api/v1/stripe/webhook`
4. **Events to listen to:**
   - ✅ `checkout.session.completed`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** → Update `STRIPE_WEBHOOK_SECRET` in `.env.production`

---

### 3. Hello.coop Production Setup

1. Go to: https://console.hello.coop
2. Update your app configuration:
   - **Redirect URI:** `https://api.yourdomain.com/auth/hello/callback`
   - **Allowed Origins:** `https://yourdomain.com`
3. Copy production Client ID and Secret to `.env.production`

---

### 4. Frontend Configuration

Update `nuxt.config.ts` for production:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      backendURL: 'https://api.yourdomain.com',
      helloClientId: 'your_hello_client_id',
    }
  },
  // ... rest of config
})
```

---

### 5. Database Setup

#### **Production Database:**
1. Create a new MongoDB database for production (separate from dev)
2. Update connection string in `.env.production`
3. Consider enabling MongoDB Atlas backup and monitoring

---

## 🚀 Deployment

### Backend Deployment (Node.js API)

#### **Option A: Deploy to Railway/Render/Heroku**

1. **Push code to GitHub**
2. **Connect your repo** to Railway/Render
3. **Set environment variables** from `.env.production`
4. **Deploy!**

#### **Option B: Deploy to VPS (DigitalOcean, AWS, etc.)**

```bash
# On your server
git clone your-repo
cd npc-gpt-api
npm install
npm run build:prod

# Use PM2 for process management
npm install -g pm2
pm2 start build/index.js --name npc-gpt-api
pm2 save
pm2 startup
```

---

### Frontend Deployment (Nuxt.js)

#### **Option A: Deploy to Vercel/Netlify**

1. **Connect GitHub repo**
2. **Build command:** `npm run generate`
3. **Output directory:** `.output/public`
4. **Set environment variables**
5. **Deploy!**

#### **Option B: Deploy to GitHub Pages (using existing script)**

```bash
cd /Users/filipeveiga/Desktop/GTS/website
chmod +x ci/deploy.sh
./ci/deploy.sh
```

---

## 🔧 Post-Deployment Verification

### Test Production Flow:

1. ✅ **User signup** → Creates organization with 5K free tokens
2. ✅ **Purchase pack** → Stripe redirects and adds tokens
3. ✅ **Generate API key** → Key appears in table
4. ✅ **Make API call** → NPC responds and tokens are deducted
5. ✅ **Check usage page** → Token balance updates
6. ✅ **Invite member** (admin only) → Member receives access
7. ✅ **Stripe webhook** → Tokens added automatically

---

## ⚠️ Important Security Checklist

- [ ] **Never commit `.env.production`** to Git
- [ ] Use **Live Stripe keys** (not test keys)
- [ ] Enable **Stripe webhook signature verification** (already implemented)
- [ ] Use **HTTPS** for all production URLs
- [ ] Set strong **TOKEN_SECRET** (random 64+ character string)
- [ ] Enable **MongoDB authentication**
- [ ] Set up **database backups**
- [ ] Configure **CORS** properly (only allow your frontend domain)
- [ ] Monitor **error logs** after deployment

---

## 🎯 Quick Start Commands

### Build for Production:

```bash
# Backend
cd npc-gpt-api
npm run build:prod

# Frontend
cd website
npm run generate
```

---

## 📞 Support Checklist

After deployment, verify:
- [ ] Signup flow works
- [ ] Login with Hello.coop works
- [ ] Purchase flow works end-to-end
- [ ] API keys work
- [ ] NPC chat API responds
- [ ] Tokens are deducted
- [ ] Usage dashboard shows correct data
- [ ] Admin can manage organization
- [ ] Webhooks are processing (check Stripe dashboard)

---

Need help with any specific deployment platform? Let me know! 🚀

