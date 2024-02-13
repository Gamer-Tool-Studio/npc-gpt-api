const { Schema } = require('mongoose');

const checkoutSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'user' },
    checkoutSessions: [Object],
  },
  { collection: 'checkout', versionKey: false },
);
checkoutSchema.set('timestamps', true);
// sessionSchema .createIndex({ closeOfferAt: 1 }, { expireAfterSeconds: 300 });

module.exports = checkoutSchema;
