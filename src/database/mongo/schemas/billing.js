const { Schema } = require('mongoose');

const TotalBillingDaySchema = new Schema(
  {
    accountId: String,
    totalInputWords: {
      type: Number,
      default: 1,
    },
    totalOutputWords: {
      type: Number,
      default: 1,
    },
  },
  { collection: 'billing', versionKey: false },
);

TotalBillingDaySchema.set('timestamps', true);

module.exports = TotalBillingDaySchema;
