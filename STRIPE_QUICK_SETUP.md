# 🚀 Stripe Setup - Quick Guide

## What You Need to Do:

### **Step 1: Create 3 Products in Stripe Dashboard**

Go to: https://dashboard.stripe.com/test/products

Create these 3 **recurring** products:

| Product | Price | Billing |
|---------|-------|---------|
| Solo Dev | $9.00 | Monthly |
| Indie Studio | $59.00 | Monthly |
| Enterprise | $259.00 | Monthly |

For each product:
1. Click "+ Add product"
2. Enter name and price
3. Select "Recurring" → "Monthly"
4. Click "Save product"
5. **Copy the Price ID** (looks like `price_1QGxxxxxxxxxx`)

---

### **Step 2: Update .env.development**

Edit: `/Users/filipeveiga/Desktop/GTS/NPC-GPT/npc-gpt-api/.env.development`

Replace these lines:
```bash
STRIPE_PRICE_SOLO_DEV=price_REPLACE_WITH_STRIPE_ID
STRIPE_PRICE_INDIE_STUDIO=price_REPLACE_WITH_STRIPE_ID
STRIPE_PRICE_ENTERPRISE=price_REPLACE_WITH_STRIPE_ID
```

With your actual Price IDs:
```bash
STRIPE_PRICE_SOLO_DEV=price_1QGxxxxxxxxxxxxx      # Your Solo Dev price ID
STRIPE_PRICE_INDIE_STUDIO=price_1QGyyyyyyyyyyyyy  # Your Indie Studio price ID
STRIPE_PRICE_ENTERPRISE=price_1QGzzzzzzzzzzzzz    # Your Enterprise price ID
```

---

### **Step 3: Restart Backend**

The backend auto-restarts when files change. Verify it's running:
```bash
lsof -i :3002 | grep LISTEN
```

---

### **Step 4: Test Payment Flow**

1. Go to: http://localhost:3001/pricing
2. Click "Subscribe" on **Solo Dev**
3. You'll see Stripe checkout with:
   - ✅ Your email pre-filled
   - ✅ $9/month subscription
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. You'll be redirected to: `http://localhost:3001/dashboard?payment=success`
7. Check usage page - should see **25K input + 10K output tokens**!

---

## 🔄 How It Works:

```
User clicks "Subscribe"
    ↓
Frontend calls: POST /api/v1/stripe/create
    ↓
Backend creates Stripe Checkout Session
    ↓
User redirected to Stripe checkout page
    ↓
User completes payment
    ↓
Stripe sends webhook: checkout.session.completed
    ↓
Backend adds tokens to user's billing account
    ↓
User redirected to: /dashboard?payment=success
```

---

## 📋 Finding Price IDs in Stripe:

1. Go to: https://dashboard.stripe.com/test/products
2. Click on a product (e.g., "Solo Dev")
3. Scroll to "Pricing" section
4. Copy the **API ID** - it starts with `price_`

Example:
```
API ID: price_1QGxyzABC123def456
```

**That's your Price ID!** Copy the entire string.

---

## 🎯 Current Setup:

- ✅ Backend: Uses Stripe Checkout Sessions API
- ✅ Frontend: Passes Stripe Price ID directly
- ✅ Webhook: Automatically adds tokens after payment
- ✅ Redirects: Returns user to dashboard
- ✅ Free Trial: No Stripe needed - just signup

---

## ⚠️ Important:

- **Test Mode**: Use test Price IDs (start with `price_` in test mode)
- **Webhook**: Will need to be configured later (for now, tokens won't be added)
- **Production**: Repeat same process in Live mode with different Price IDs


