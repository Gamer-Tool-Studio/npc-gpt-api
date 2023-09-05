const { Schema } = require('mongoose');

const sessionSchema = new Schema(
  {
    accountId: String,
    sessionId: String,
  },
  { collection: 'session', versionKey: false },
);
sessionSchema.set('timestamps', true);
// sessionSchema .createIndex({ closeOfferAt: 1 }, { expireAfterSeconds: 300 });

module.exports = sessionSchema;
