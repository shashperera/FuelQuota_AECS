const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  first_name: {
    type: String, default: null },
  last_name: {
    type: String, default: null },
  email: {
    type: String, unique: true },
  password: {
    type: String },
})

const Auth = mongoose.model("user", UserSchema);

module.exports = Auth;