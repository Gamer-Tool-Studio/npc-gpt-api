# 🎯 Production Setup - Step by Step

## Step 1: Stripe Live Mode Setup (15 minutes)

### A. Switch to Live Mode
1. Go to: https://dashboard.stripe.com
2. **Toggle to "Live mode"** (top right corner - switch from Test to Live)

### B. Create Live Products (if not already created)

For each pack, create a product:

**Solo Dev:**
1. Products → "+ Add product"
2. Name: `Solo Dev Pack`
3. Description: `25,000 input tokens + 10,000 output tokens for 1 seat`
4. Pricing: **One-time** payment of **$9.00 USD**
5. Click "Add pricing" → Copy the **API ID** (starts with `price_`)

**Indie Studio:**
1. Same steps, but:
   - Price: **$59.00 USD**
   - Description: `250,000 input + 100,000 output tokens for 3 seats`

**Enterprise:**
1. Same steps, but:
   - Price: **$259.00 USD**
   - Description: `25M input + 10M output tokens for unlimited seats`

### C. Get Your Live API Keys
1. Go to: https://dashboard.stripe.com/apikeys (in **Live mode**)
2. Copy **Secret key** (starts with `sk_live_`)
3. Save it - you'll need it for `.env.production`

### D. Configure Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://api.YOUR_DOMAIN.com/api/v1/stripe/webhook`
   - Replace `YOUR_DOMAIN.com` with your actual domain!
4. **Description:** `Production webhook for token pack purchases`
5. **Events to listen to:**
   - Search and select: `checkout.session.completed`
6. Click **"Add endpoint"**
7. **Click on the webhook you just created**
8. **Copy the "Signing secret"** (starts with `whsec_`)

---

## Step 2: Update Production Environment File

Edit `/Users/filipeveiga/Desktop/GTS/NPC-GPT/npc-gpt-api/.env.production`:

```bash
# Critical changes for production:

# 1. Environment
NODE_ENV=production

# 2. URLs (⚠️ REPLACE WITH YOUR ACTUAL DOMAINS!)
FRONTEND_URL=https://gamertoolstudio.com
BACKEND_URL=https://api.gamertoolstudio.com
DOMAIN_ENV=production

# 3. Database (⚠️ Use production database!)
DB_NAME=gts-db-production

# 4. Stripe LIVE Keys (⚠️ NOT test keys!)
STRIPE_SECRET_KEY=sk_live_PASTE_YOUR_LIVE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_PASTE_YOUR_WEBHOOK_SECRET_HERE

# 5. Stripe LIVE Price IDs
STRIPE_PRICE_SOLO_DEV=price_PASTE_SOLO_DEV_LIVE_PRICE_ID
STRIPE_PRICE_INDIE_STUDIO=price_PASTE_INDIE_STUDIO_LIVE_PRICE_ID
STRIPE_PRICE_ENTERPRISE=price_PASTE_ENTERPRISE_LIVE_PRICE_ID

# 6. Security (⚠️ Generate a strong random secret!)
TOKEN_SECRET=GENERATE_A_STRONG_64_CHARACTER_RANDOM_STRING

# 7. CORS (⚠️ Set to your actual frontend domain!)
ALLOWED_ORIGINS=https://gamertoolstudio.com

# 8. Hello.coop Callback (⚠️ Update in Hello.coop dashboard too!)
# In Hello.coop console, set redirect URI to:
# https://api.YOUR_DOMAIN.com/auth/hello/callback
```

---

## Step 3: Update Hello.coop Configuration

1. Go to: https://console.hello.coop
2. Select your app
3. **Update Redirect URIs:**
   - Add: `https://api.YOUR_DOMAIN.com/auth/hello/callback`
4. **Update Allowed Origins:**
   - Add: `https://YOUR_DOMAIN.com`
5. Save changes

---

## Step 4: Deploy Backend

### Option A: Railway (Recommended - Easy)

1. Go to: https://railway.app
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `npc-gpt-api` repo
4. **Root Directory:** Leave blank (or set to `/npc-gpt-api` if in monorepo)
5. **Build Command:** `npm install && npm run build:prod`
6. **Start Command:** `node dist/index.js`
7. **Add all environment variables** from your `.env.production`
8. Click **"Deploy"**
9. Railway will give you a URL like `https://your-app.railway.app`
10. **Set up custom domain:** Settings → Domains → Add your API domain

### Option B: Render

1. Go to: https://render.com
2. **"New +" → "Web Service"**
3. Connect GitHub repo
4. **Build Command:** `npm install && npm run build:prod`
5. **Start Command:** `node dist/index.js`
6. **Add environment variables**
7. Deploy!

### Option C: VPS (DigitalOcean, AWS, etc.)

```bash
# On your server
git clone YOUR_REPO_URL
cd npc-gpt-api
npm install
npm run build:prod

# Install PM2 for process management
npm install -g pm2

# Start with production env
pm2 start dist/index.js --name npc-gpt-api --env production

# Save PM2 config
pm2 save
pm2 startup
```

---

## Step 5: Deploy Frontend

### Option A: Vercel (Recommended for Nuxt)

1. Go to: https://vercel.com
2. **"Add New" → "Project"**
3. Import your `website` repo
4. **Framework Preset:** Nuxt.js
5. **Build Command:** `npm run generate`
6. **Output Directory:** `.output/public`
7. **Environment Variables:**
   ```
   NUXT_PUBLIC_BACKEND_URL=https://api.YOUR_DOMAIN.com
   NUXT_PUBLIC_HELLO_CLIENT_ID=your_hello_client_id
   ```
8. Deploy!
9. Add custom domain in Settings

### Option B: Netlify

Similar to Vercel, but:
- **Publish directory:** `.output/public`
- Add environment variables in Site settings

### Option C: GitHub Pages (using existing script)

**⚠️ Note:** GitHub Pages doesn't support server-side rendering, only static sites.

```bash
cd /Users/filipeveiga/Desktop/GTS/website
chmod +x ci/deploy.sh
./ci/deploy.sh
```

---

## Step 6: Post-Deployment Testing

### Test the Complete Flow:

1. **Go to your production frontend**
   - https://YOUR_DOMAIN.com

2. **Test Signup:**
   - Click "Start Free Trial"
   - Sign up with Hello.coop
   - Verify you get 5,000 input + 5,000 output tokens

3. **Test Purchase:**
   - Go to Pricing
   - Buy "Solo Dev" pack ($9)
   - Use real credit card (you'll be charged!)
   - Verify tokens are added (check usage page)
   - Should show: +25,000 input, +10,000 output

4. **Test API:**
   - Generate an API key in dashboard
   - Make a test request:

```bash
curl -X POST https://api.YOUR_DOMAIN.com/api/v1/chat/send-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "userInput": "Hello!",
    "chatHistory": [],
    "characterContext": {
      "name": "Blacksmith",
      "personality": "Gruff but friendly"
    }
  }'
```

5. **Verify:**
   - AI responds correctly
   - Tokens are deducted
   - Usage page updates

---

## 🔒 Security Checklist

Before going live:

- [ ] `.env.production` is NOT committed to Git
- [ ] Using **Live Stripe keys** (not test)
- [ ] All URLs use **HTTPS**
- [ ] Strong `TOKEN_SECRET` (64+ random chars)
- [ ] CORS set to **actual frontend domain only**
- [ ] Production database is separate from dev
- [ ] Database backups enabled
- [ ] Webhook endpoint is secured with signature verification
- [ ] Hello.coop redirect URI updated

---

## 📊 Monitoring After Launch

### Check These Daily (First Week):

1. **Stripe Dashboard:**
   - Successful payments
   - Webhook delivery status
   - Failed payments

2. **Database:**
   - User signups
   - Token balances
   - API key creation

3. **Logs:**
   - API errors
   - Authentication failures
   - Billing issues

---

## 🆘 Common Production Issues

### Issue: Stripe webhook not working
**Solution:** 
- Verify webhook URL is correct
- Check webhook secret in `.env.production`
- Check Stripe Dashboard → Webhooks → View logs

### Issue: Hello.coop login fails
**Solution:**
- Verify redirect URI in Hello.coop console matches production
- Check HELLO_CLIENT_ID and HELLO_CLIENT_SECRET

### Issue: CORS errors
**Solution:**
- Update `ALLOWED_ORIGINS` to match your exact frontend domain
- Ensure no trailing slashes

---

## 🎯 What's Next?

After successful deployment:

1. **Test everything** with real money (small amount)
2. **Monitor logs** for first 24 hours
3. **Set up alerts** for critical errors
4. **Create backup strategy** for database
5. **Document API** for your users
6. **Set up analytics** (optional)

---

## 📞 Need Help?

If you encounter issues during deployment, check:
1. Backend logs for specific errors
2. Browser console for frontend errors
3. Stripe webhook logs for payment issues
4. Database connection logs

---

## 🚀 Ready to Deploy?

Follow the steps above in order. Start with Stripe setup, then environment variables, then deploy backend, then frontend.

Good luck! 🎉

---

## Step 1: Update `.env.production`

Update `/Users/filipeveiga/Desktop/GTS/NPC-GPT/npc-gpt-api/.env.production` with your production values:
