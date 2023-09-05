const { Schema } = require('mongoose');

const BillingDaySchema = new Schema(
  {
    accountId: String,
    inputWords: {
      type: Number,
      default: 0,
    },
    outputWorks: {
      type: Number,
      default: 0,
    },
    key: String,
  },
  { collection: 'billingDay', versionKey: false },
);

BillingDaySchema.set('timestamps', true);

module.exports = BillingDaySchema;
