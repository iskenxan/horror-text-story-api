import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';
import userRoute from './rest-handlers/user';
import { verifyToken } from './encrypt';

import { InvalidArgumentError } from './utils/errors';

const NON_SECURE_PATHS = ['/user/login', '/user/signup', '/user/logout'];

const app = express();
app.use(bodyParser.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.post('*', (req, res, next) => {
  const { token } = req.body;
  if (_.includes(NON_SECURE_PATHS, req.path)) return next();

  if (token) {
    return verifyToken(token).then((username) => {
      res.locals.username = username;
      next();
    })
      .catch(error => next(error));
  }
  return next(new InvalidArgumentError('No token was passed'));
});

app.use('/user', userRoute);


const resultHandling = (req, res, next) => {
  if (res.locals.result) {
    res.status(200).send({ ok: true, result: res.locals.result });
  }
  next();
};

app.use(resultHandling);


// eslint-disable-next-line no-unused-vars
const errorHandling = (err, req, res, next) => {
  let status = err.status || 500;
  if (err.code === 5) {
    status = 404;
  }
  const message = status === 500 ? 'Internal server error' : err.message;
  let stackTrace = null;
  if (!process.env.NODE_ENV || !process.evn.NODE_ENV === 'production') {
    stackTrace = err.stack;
  }
  res.status(status).send({
    ok: false,
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
