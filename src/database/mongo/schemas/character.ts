import { Schema } from 'mongoose';

const CharacterSchema = new Schema(
  {
    id: String,
    name: String,
    description: String,
    image: String,
  },
  { collection: 'characters', versionKey: false },
);
CharacterSchema.set('timestamps', true);

CharacterSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

const methods: any[] = [];

export = { schema: CharacterSchema, methods };
