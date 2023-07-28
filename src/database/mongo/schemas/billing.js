const Schema = require('mongoose').Schema

const TotalBillingDaySchema = new Schema(
  {
    accountId: String,
    totalInputWords: Number,
    totalOutputWords: Number
  },
  { collection: 'billingDay', versionKey: false }
)

TotalBillingDaySchema.set('timestamps', true)

module.exports = TotalBillingDaySchema
