const { Schema } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema(
  {
    ext_id: String,
    username: String,
    email: String,
    password: String,
    type: String,
    photo: String,
    user_data: String,
    tokens: [String],
  },
  { collection: 'user', versionKey: false },
);
UserSchema.set('timestamps', true);
// sessionSchema .createIndex({ closeOfferAt: 1 }, { expireAfterSeconds: 300 });

// UserSchema.prototype.validPass = function (pw) {
//   console.log('password');
//   return bcrypt.compareSync(pw, this.password);
// };

// UserSchema.addHook('beforeCreate', (newUser) => {
//   newUser.password = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(10), null);
// });

UserSchema.methods.verifyPassword = function verifyPassword(pw) {
  return bcrypt.compareSync(pw, this.password);
};

UserSchema.methods.setPassword = function setPassword(pw) {
  this.password = bcrypt.hashSync(pw, bcrypt.genSaltSync(10), null);
};

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

module.exports = UserSchema;
