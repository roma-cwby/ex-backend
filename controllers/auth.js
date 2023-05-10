const { User } = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const httpError = require('../helpers/httpError');
const ctrlWrapper = require('../helpers/ctrlWrapper');

const { TOKEN_KEY } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) throw httpError(409, 'Email already in use');

  const hashPass = await bcrypt.hash(password, 10);

  let avatarURL = gravatar.url(email);
  avatarURL += '?d=identicon';

  const newUser = await User.create({ ...req.body, password: hashPass, avatarURL });

  const payload = {
    id: newUser._id,
  };

  const token = jwt.sign(payload, TOKEN_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(newUser._id, { token });

  res.status(200).json({
    user: {
	id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: avatarURL,
    },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw httpError(401, 'Email or password invalid');

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) throw httpError(401, 'Email or password invalid');

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, TOKEN_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    user: {
	id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatarURL,
    },
    token,
  });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { token: '' });
  res.status(201).json({});
};

const current = async (req, res) => {
  res.status(200).json({ id: req.user._id, name: req.user.name, email: req.user.email, avatar: req.user.avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
};
