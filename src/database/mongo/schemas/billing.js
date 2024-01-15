const { Schema } = require('mongoose');

const TotalBillingDaySchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'user' },
    inputWords: {
      type: Number,
      default: 0,
    },
    outputWords: {
      type: Number,
      default: 0,
    },
    availableInputTokens: {
      type: Number,
      default: 0,
    },

    availableOutputTokens: {
      type: Number,
      default: 0,
    },

  },
  { collection: 'billing', versionKey: false },
);

TotalBillingDaySchema.set('timestamps', true);

module.exports = TotalBillingDaySchema;
