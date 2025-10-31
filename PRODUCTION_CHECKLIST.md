# ✅ Production Deployment Checklist

## Before You Start

**What domains will you use?**
- [ ] Frontend: `https://_______________`
- [ ] Backend API: `https://api._______________`

---

## 🔴 Step 1: Stripe Live Mode (15 min)

- [ ] Switch Stripe to **Live mode** (top right toggle)
- [ ] Create 3 products with **one-time** pricing:
  - [ ] Solo Dev - $9
  - [ ] Indie Studio - $59  
  - [ ] Enterprise - $259
- [ ] Copy all 3 **Price IDs** (price_xxxxx)
- [ ] Get **Live Secret Key** (sk_live_xxxxx)
- [ ] Create webhook endpoint: `https://api.YOUR_DOMAIN.com/api/v1/stripe/webhook`
- [ ] Select event: `checkout.session.completed`
- [ ] Copy **Webhook Secret** (whsec_xxxxx)

---

## 🟡 Step 2: Update .env.production (5 min)

Edit: `/Users/filipeveiga/Desktop/GTS/NPC-GPT/npc-gpt-api/.env.production`

**Change these lines:**
```bash
NODE_ENV=production                           # ← Change from development
FRONTEND_URL=https://YOUR_DOMAIN.com          # ← Your actual domain
BACKEND_URL=https://api.YOUR_DOMAIN.com       # ← Your actual API domain
DB_NAME=gts-db-production                     # ← Production database
STRIPE_SECRET_KEY=sk_live_xxxxx               # ← Live key from Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxxxx             # ← Webhook secret from Stripe
STRIPE_PRICE_SOLO_DEV=price_xxxxx             # ← Live price ID
STRIPE_PRICE_INDIE_STUDIO=price_xxxxx         # ← Live price ID
STRIPE_PRICE_ENTERPRISE=price_xxxxx           # ← Live price ID
ALLOWED_ORIGINS=https://YOUR_DOMAIN.com       # ← Your actual domain
TOKEN_SECRET=GENERATE_64_CHAR_RANDOM_STRING   # ← Generate new secure secret
```

**Generate random TOKEN_SECRET:**
```bash
openssl rand -base64 48
```

---

## 🟢 Step 3: Update Hello.coop (3 min)

1. Go to: https://console.hello.coop
2. Select your app: `app_AADlRSShEPtt5l9snKYqDKwd_84S`
3. **Update Redirect URI:**
   - Add: `https://api.YOUR_DOMAIN.com/auth/hello/callback`
4. **Update Allowed Origins:**
   - Add: `https://YOUR_DOMAIN.com`
5. Save

---

## 🔵 Step 4: Deploy Backend

### Option A: Railway (Easiest)

1. Go to: https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo
4. **Add ALL variables from `.env.production`**
5. Deploy
6. Add custom domain → `api.YOUR_DOMAIN.com`

### Option B: Render

1. Go to: https://render.com
2. "New +" → "Web Service"
3. Connect repo
4. Build: `npm run build:prod`
5. Start: `node dist/index.js`
6. Add environment variables
7. Add custom domain

---

## 🟣 Step 5: Deploy Frontend

### Option A: Vercel (Recommended)

1. Go to: https://vercel.com
2. Import project
3. **Environment Variables:**
   ```
   NUXT_PUBLIC_BACKEND_URL=https://api.YOUR_DOMAIN.com
   NUXT_PUBLIC_HELLO_CLIENT_ID=app_AADlRSShEPtt5l9snKYqDKwd_84S
   ```
4. Deploy
5. Add custom domain → `YOUR_DOMAIN.com`

---

## 🧪 Step 6: Test Production

- [ ] Visit production frontend
- [ ] Sign up for free trial
- [ ] Verify 5,000 tokens added
- [ ] Purchase Solo Dev pack ($9)
- [ ] Verify 25,000 input + 10,000 output added
- [ ] Generate API key
- [ ] Make test API call
- [ ] Verify tokens deducted
- [ ] Check usage page updates

---

## ✅ Launch Checklist

- [ ] Stripe in Live mode with real products
- [ ] Webhook configured and tested
- [ ] `.env.production` updated with all values
- [ ] Hello.coop redirect URIs updated
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] End-to-end purchase flow tested
- [ ] API key generation works
- [ ] NPC chat API responding
- [ ] Token billing working correctly

---

## 🎉 You're Live!

Once all checkboxes are ticked, your B2B SaaS is live and ready for customers!

**Monitor closely for the first 48 hours:**
- Check Stripe Dashboard for payments
- Monitor backend logs for errors
- Watch for any webhook failures
- Verify all signups get proper tokens

---

## 🔗 Quick Links (Bookmark These)

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Webhooks: https://dashboard.stripe.com/webhooks
- Hello.coop Console: https://console.hello.coop
- MongoDB Atlas: https://cloud.mongodb.com

---

**Good luck with your launch! 🚀**

