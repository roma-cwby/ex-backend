const { Schema, model } = require('mongoose');
const joi = require('joi');

const emailRejex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      match: emailRejex,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      minlength: 6,
      require: true,
    },
    token: {
      type: String,
      default: '',
    },
    avatarURL: {
      type: String,
      require: true,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post('save', (error, data, next) => {
  const { name, code } = error;
  if (name === 'MongoServerError' && code === 11000) {
    error.status = 409;
    error.message = 'Email in use';
  }

  error.status = 400;

  next();
});

const registerSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().pattern(emailRejex).required(),
  password: joi.string().min(6).required(),
});

const loginSchema = joi.object({
  email: joi.string().pattern(emailRejex).required(),
  password: joi.string().min(6).required(),
});

const User = model('user', userSchema);

module.exports = { User, registerSchema, loginSchema };
