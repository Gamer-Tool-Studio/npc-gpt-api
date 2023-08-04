const Schema = require('mongoose').Schema

const accountSchema = new Schema(
  {
    accountId: Object,
    apiSecret: Object,
    email: String
  },
  { collection: 'account', versionKey: false }
)
accountSchema.set('timestamps', true)

module.exports = accountSchema
