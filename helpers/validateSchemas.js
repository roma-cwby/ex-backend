const httpError = require('./httpError');

const validateBody = schema => async (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) next(httpError(400, error.message));
  next();
};

module.exports = validateBody;
