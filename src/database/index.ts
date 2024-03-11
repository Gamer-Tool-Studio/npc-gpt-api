/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import { DataBase } from 'src/types/schemas';
import { DataBaseSchemas } from 'src/types/enums';

import config from 'src/config';

import connectToMongo from './mongo';

const {
  COMPLEMENT, DB_HOST, DB_NAME, DB_PASS, DB_USER,
} = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('database');

// create a string for the mongoDB URI from the environment variables

const databaseURL = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}${COMPLEMENT}`;
// url += process.env.DB_PORT + '/';
// url += '?authSource=admin';
// url += '?replicaSet=' + process.env.REPL_SET;

logDebug('MONGO URI CONNECTED : ', databaseURL);
const mongoDB: Record<string, any> = connectToMongo(databaseURL);

if (!mongoDB) {
  logError('[DATABASE] ');
}

const Database: DataBase = {
  // Generic methods

  create: (schema: DataBaseSchemas, data: any, options: any) => mongoDB[schema].create(data, options),
  find: (schema: DataBaseSchemas, filter: any, select: any, options: any) => mongoDB[schema].find(filter, select, options),
  findOne: (schema: DataBaseSchemas, filter: any, select: any, options: any) => mongoDB[schema].findOne(filter, select, options),
  findOneAndUpdate: (schema: DataBaseSchemas, filter: any, update: any, options: any) => mongoDB[schema].findOneAndUpdate(filter, update, options),

  // Schema specific methods
  createTokenMap: (data: any, options: any) => mongoDB.token.create(data, options),
  findToken: (filter: any, select: any, options: any) => mongoDB.token.findOne(filter, select, options),

  findUser: (filter: any, select: any, options: any) => mongoDB.user.find(filter, select, options),
  findSingleUser: (filter: any, select: any, options: any) => mongoDB.user.findOne(filter, select, options),
  findUserAndUpdate: (filter: any, update: any, options: any) => mongoDB.user.findOneAndUpdate(filter, update, options),
  UpdateOneUser: (filter: any, update: any, options: any) => mongoDB.user.updateOne(filter, update, options),
  findUserById: (id: any) => mongoDB.user.findById(id),
  registerUser: (data: any, options: any) => mongoDB.user.create(data, options),

  findSKU: (data: any, options: any) => mongoDB.sku.findOne(data, options),

  findOneCharacter: (filter: any, select: any, options: any) => mongoDB.character.findOne(filter, select, options),

  findAndUpdateBillingDay: (query: any, data: any, options: any) => mongoDB.billingDay.updateOne(query, data, options),
  findBillingDayUpdate: (filter: any, select?: any, options?: any) => {
    return mongoDB.billingDay.findOneAndUpdate(filter, select, options);
  },
  findBillingDay: (filter: any, select?: any, options?: any) => mongoDB.billingDay.find(filter, select, options),

  findAndUpdateBillingLog: (query: any, data: any, options: any) => {
    return mongoDB.billing.findOneAndUpdate(query, data, options);
  },

  findBillingDayAggregate: async (year: number, month: number, accountId: any) => {
    try {
      const result = await mongoDB.billingDay.aggregate([
        {
          $match: { accountId },
        },
        {
          $unwind: '$dailyValues',
        },
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $year: '$dailyValues.date' }, year] },
                { $eq: [{ $month: '$dailyValues.date' }, month] },
              ],
            },
          },
        },
        {
          $group: {
            _id: '$accountId',
            data: {
              $push: {
                input: '$dailyValues.inputWords',
                output: '$dailyValues.outputWords',
                date: '$dailyValues.date',
              },
            },
          },
        },
      ]);

      if (result.length > 0) {
        const monthlyData = result[0].data;
        const numberOfDaysInMonth = new Date(year, month, 0).getDate();
        const input = Array(numberOfDaysInMonth).fill(0);
        const output = Array(numberOfDaysInMonth).fill(0);

        monthlyData.forEach((entry: { date: string | number | Date; input: number; output: number }): void => {
          const dayOfMonth = new Date(entry.date).getDate();
          input[dayOfMonth - 1] += entry.input;
          output[dayOfMonth - 1] += entry.output;
        });

        return { input, output };
      }
      return 0;
    } catch (err) {
      logError('Error retrieving data:', err);
      throw err;
    }
  },
};

export default Database;
