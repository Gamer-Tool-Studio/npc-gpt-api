const { Schema } = require('mongoose');

const BillingDaySchema = new Schema(
  {
    accountId: String,
    outputWords: Number,
    inputWords: Number,
    key: String,
  },
  { collection: 'billingDay', versionKey: false },
);

// const BillingDaySchema = new Schema(
//   {
//     accountId: String,
//     dailyValues: [
//       {
//         date: Date,
//         inputWords: Number, // Daily input value
//         outputWords: Number, // Daily output value
//       },
//     ],

//     key: String,
//   },
//   { collection: 'billingDay', versionKey: false },
// );

BillingDaySchema.set('timestamps', true);

module.exports = BillingDaySchema;
