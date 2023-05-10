const app = require('./app');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const { DB_HOST } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3001);
    console.log('Connection');
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  });
