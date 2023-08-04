const Schema = require('mongoose').Schema

const BillingDaySchema = new Schema(
  {
    accountId: String,
    inputWords: String,
    outputWorks: Number,
    key: String
  },
  { collection: 'billingDay', versionKey: false }
)

BillingDaySchema.set('timestamps', true)

module.exports = BillingDaySchema
