const Schema = require('mongoose').Schema

const BillingDaySchema = new Schema(
  {
    accountId: String,
    inputWords: String,
    outputWorks: Number
  },
  { collection: 'billingDay', versionKey: false }
)

BillingDaySchema.set('timestamps', true)

module.exports = BillingDaySchema
