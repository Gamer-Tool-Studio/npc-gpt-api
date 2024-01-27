const { Schema } = require('mongoose');

const checkoutSchema = new Schema(
  {
    accountId: String,
    sessionId: String,
    checkoutSessions: [Object],
  },
  { collection: 'checkout', versionKey: false },
);
checkoutSchema.set('timestamps', true);
// sessionSchema .createIndex({ closeOfferAt: 1 }, { expireAfterSeconds: 300 });

module.exports = checkoutSchema;
