require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const router = require('./routes');

const port = process.env.PORT || 3000;
const app = express();

const Producer = require('./amqp/producer');

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
function listen() {
 try {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
 } catch (error) {
   console.error(error);
 }
}

function connect() {
  Producer.amqpStart();
  mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);
  return mongoose.connect('mongodb://root:pass123@ds149218.mlab.com:49218/ipfsbox',
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
}

connect();
