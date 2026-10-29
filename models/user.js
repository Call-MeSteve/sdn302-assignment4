const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const plugin = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new Schema({
  username: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  },
  adminSecret: {
    type: String,
    default: ''
  }
});

userSchema.plugin(plugin);

module.exports = mongoose.model('User', userSchema);
