require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(require('./routes'));
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
