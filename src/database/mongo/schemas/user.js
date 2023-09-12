const { Schema } = require('mongoose');
var bcrypt = require('bcryptjs');

const UserSchema = new Schema(
  {
    user_id: String,
    username: String,
    email: String,
    password: String,
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

UserSchema.methods.verifyPassword = function (pw) {
  console.log('password to verify ', pw);
  return bcrypt.compareSync(pw, this.password);
};

UserSchema.methods.setPassword = function (pw) {
  this.password = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(10), null);
};

module.exports = UserSchema;
