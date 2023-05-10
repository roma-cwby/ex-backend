const { Schema, model, SchemaTypes } = require('mongoose');
const joi = require('joi');

const postSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
      required: true,
    },
    text: {
      type: String,
      require: true,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    comments: {
      type: [
        {
          owner: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          text: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

postSchema.post('save', (error, data, next) => {
  error.status = 400;
  next();
});

const addPostSchema = joi.object({
  title: joi.string().required(),
  genres: joi.array().items(joi.string()).required(),
  text: joi.string().required(),
});

const addCommentarySchema = joi.object({
  text: joi.string().required(),
});

const Post = model('post', postSchema);

module.exports = { Post, addPostSchema, addCommentarySchema };
