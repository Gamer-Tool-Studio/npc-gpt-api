const { Schema } = require('mongoose');

const BillingDaySchema = new Schema(
  {
    accountId: String,
    dailyValues: [
      {
        date: Date,
        inputWords: Number, // Daily input value
        outputWords: Number, // Daily output value
      },
    ],

    key: String,
  },
  { collection: 'billingDay', versionKey: false },
);
// BillingDaySchema.aggregate([
//   {
//     $match: {
//       userId: 'yourUserId', // Replace with the actual user ID
//     },
//   },
//   {
//     $project: {
//       dailyValues: 1,
//     },
//   },
//   {
//     $unwind: '$dailyValues',
//   },
//   {
//     $group: {
//       _id: {
//         year: { $year: '$dailyValues' },
//         month: { $month: '$dailyValues' },
//       },
//       total: { $sum: '$dailyValues' },
//     },
//   },
//   {
//     $match: {
//       '_id.year': year,
//       '_id.month': month,
//     },
//   },
// ])
//   .then((result) => {
//     if (result.length > 0) {
//       console.log(result[0].total); // Total value for June 2022
//     } else {
//       console.log('No data found for June 2022.');
//     }
//   })
//   .catch((err) => {
//     console.error('Error retrieving data:', err);
//   });

BillingDaySchema.set('timestamps', true);

module.exports = BillingDaySchema;
