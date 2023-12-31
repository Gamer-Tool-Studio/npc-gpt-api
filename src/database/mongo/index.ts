const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('mongo');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const mongoModels: Record<string, unknown> = {};

function loadModels() {
  const pathSchemas = path.resolve('./src/database/mongo/schemas/');

  logDebug('pathSchemas : ', pathSchemas);

  // const account = './schemas/account';
  // const billing = './schemas/billing';
  // const billingDay = './schemas/billingDay';

  // MongoModels.account = mongoose.model('account', require(`${account}`));
  // MongoModels.billing = mongoose.model('billing', require(`${billing}`));
  // MongoModels.billingDay = mongoose.model('billingDay', require(`${billingDay}`));

  fs.readdirSync(pathSchemas).forEach(async (file: string) => {
    const extension = file.slice(file.length - 3, file.length);
    if (file === 'index.ts' || !['.js', '.ts'].includes(extension)) return;
    try {
      const schema = file.slice(0, file.length - 3);
      // eslint-disable-next-line operator-linebreak
      const schemaFile =
        extension === '.ts'
          ? // eslint-disable-next-line import/no-dynamic-require, global-require
            (await require(`./schemas/${file}`).schema) || (await require(`./schemas/${file}`).default)
          : // eslint-disable-next-line import/no-dynamic-require, global-require
            await require(`./schemas/${file}`);

      mongoModels[schema] = mongoose.model(schema, schemaFile);
      // eslint-disable-next-line no-console
    } catch (err) {
      logError('Error loading schema ', file, ' ', err);
    }
  });
}

export = (url: string) => {
  try {
    logDebug('uurl', url);
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
      // useCreateIndex: false,
      connectTimeoutMS: 10000,
      retryWrites: false,
    });
    logDebug('pathSchemas url : ', url);

    mongoose.connection.on('connected', () => logDebug('Connection to database established'));
    loadModels();
    return mongoModels;
  } catch (error) {
    logDebug('[DATABASE] ', error);
    return null;
  }
};
