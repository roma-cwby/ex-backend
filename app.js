const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', authRouter);
app.use('/api/posts', postsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(err.status ? err.status : 500).json({ message: err.message });
});

module.exports = app;
