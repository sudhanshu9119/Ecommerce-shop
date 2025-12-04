const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
 avatar: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "thumbnails.files", 
  default: null
}

}, 
{ timestamps: true });

const AuthUser = mongoose.model('AuthUser', authUserSchema);

module.exports = AuthUser;
