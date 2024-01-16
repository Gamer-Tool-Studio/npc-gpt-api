import { Schema, model } from 'mongoose';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('stripe');

const SkuSchema = new Schema(
  {
    id: String,
    price_id: String,
    value: String,
    outputTokens: Number,
    inputTokens: Number,
    description: String,
    image: String,
    active: Boolean,
    featured: Boolean,
    platform: String,
  },
  {
    collection: 'sku',
    versionKey: false,
    statics: {
      findSKU: (filter, select, options) => {
        logDebug('findSKU', filter);
        return model('skus').findOne(filter, select, options);
      },
    },
  },
);
SkuSchema.set('timestamps', true);

SkuSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

export = { schema: SkuSchema };
