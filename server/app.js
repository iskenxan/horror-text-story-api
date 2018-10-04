const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./rest-handlers/user');


const app = express();
app.use(bodyParser.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.use('/user', userRoute);


// eslint-disable-next-line no-unused-vars
const errorHandling = (err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  let stackTrace = null;
  if (!process.env.NODE_ENV || !process.evn.NODE_ENV === 'production') {
    stackTrace = err.stack;
  }
  res.status(status).send({
    error: {
      status,
      message,
      stackTrace,
    },
  });
};


app.use(errorHandling);


const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
