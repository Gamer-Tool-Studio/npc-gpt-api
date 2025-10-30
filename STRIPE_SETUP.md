# Stripe Setup Guide for GameToolStudio

## 🎯 Overview
This guide will help you set up Stripe payment integration for your 4 pricing plans.

---

## 📋 Step 1: Create Products in Stripe Dashboard

Go to: https://dashboard.stripe.com/test/products

### **Create 3 Products** (Trial is free, no Stripe product needed):

#### **1. Solo Dev - $9/month**
- Click "+ Add product"
- **Name**: `Solo Dev`
- **Description**: `25K input tokens, 10K output tokens, 1 seat`
- **Pricing model**: `Recurring`
- **Price**: `$9.00 USD`
- **Billing period**: `Monthly`
- Click "Save product"
- **Copy the Price ID** (looks like `price_xxxxxxxxxxxxx`)

#### **2. Indie Studio - $59/month**
- Click "+ Add product"
- **Name**: `Indie Studio`
- **Description**: `250K input tokens, 100K output tokens, 3 seats`
- **Pricing model**: `Recurring`
- **Price**: `$59.00 USD`
- **Billing period**: `Monthly`
- Click "Save product"
- **Copy the Price ID**

#### **3. Enterprise - $259/month**
- Click "+ Add product"
- **Name**: `Enterprise`
- **Description**: `25M input tokens, 10M output tokens, unlimited seats`
- **Pricing model**: `Recurring`
- **Price**: `$259.00 USD`
- **Billing period**: `Monthly`
- Click "Save product"
- **Copy the Price ID**

---

## 📋 Step 2: Update Environment Variables

### **Development (.env.development)**
```bash
STRIPE_PRICE_SOLO_DEV=price_xxxxxxxxxxxxx       # Replace with your test price ID
STRIPE_PRICE_INDIE_STUDIO=price_xxxxxxxxxxxxx   # Replace with your test price ID
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx     # Replace with your test price ID
```

### **Production (.env.production)**
Repeat the same process in **Live mode** in Stripe and add those price IDs.

---

## 📋 Step 3: Configure Webhook (for payment completion)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: `http://localhost:3002/webhook/stripe` (for dev)
   - For production: `https://your-api-domain.com/webhook/stripe`
4. **Events to send**: Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
5. Click "Add endpoint"
6. **Copy the Webhook Secret** (starts with `whsec_`)
7. Add to `.env.development`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## 📋 Step 4: Test the Integration

### **Test a Payment:**
1. Go to: `http://localhost:3001/pricing`
2. Click "Subscribe" on **Solo Dev** plan
3. You'll be redirected to Stripe checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Complete payment
6. You should be redirected to dashboard with `?payment=success`
7. Check your usage page - tokens should be added!

### **Test Webhook:**
```bash
# Check backend logs for webhook
tail -f /tmp/backend.log | grep "checkout.session.completed\|addTokens"
```

You should see:
- ✅ `checkout.session.completed` event received
- ✅ `addTokens: <session_id>`
- ✅ `Adding tokens: { inputTokens: 25000, outputTokens: 10000 }`
- ✅ `userBilling updated`

---

## 🔧 Current Configuration

### **Success/Cancel URLs:**
- **Success**: `{FRONTEND_URL}/dashboard?payment=success`
- **Cancel**: `{FRONTEND_URL}/pricing?payment=cancelled`

### **Token Allocation:**
Handled via `metadata` in checkout session - no database SKU needed!

---

## 🚨 Important Notes

1. **Test Mode**: Always test with test price IDs first
2. **Webhook**: Ensure webhook is accessible (use ngrok for local dev if needed)
3. **Trial Plan**: Free trial doesn't use Stripe - goes to signup page directly
4. **Double Processing**: Webhook checks for duplicate sessions automatically

---

## 📚 Next Steps

1. Create the 3 products in Stripe Dashboard
2. Copy the price IDs
3. Update `.env.development` with the price IDs
4. Restart backend: `npm run dev`
5. Test a payment with the test card

---

## 🆘 Troubleshooting

### Checkout doesn't open:
- Check browser console for errors
- Verify price IDs are correct in `.env.development`
- Ensure backend is running

### Tokens not added after payment:
- Check webhook is configured
- Verify webhook secret is correct
- Check backend logs for webhook events

### "Invalid price ID" error:
- Ensure price IDs start with `price_`
- Verify they exist in your Stripe account
- Check they're from test mode (not live mode)


