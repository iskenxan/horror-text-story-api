import express from 'express';
import bodyParser from 'body-parser';
import user from './rest-handlers/user';
import search from './rest-handlers/search';
import posts from './rest-handlers/posts';
import feed from './rest-handlers/feed';
import { verifyToken } from './encrypt';
import { AuthenticationError } from './utils/errors';


const NON_SECURE_PATHS = ['/user/auth', '/user/profile/profile-image/save'];

const app = express();
app.use(bodyParser.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


// Security token check
app.post('*', (req, res, next) => {
  const { token } = req.body;
  let notSecure = false;
  NON_SECURE_PATHS.filter((path) => {
    if (req.path.includes(path)) notSecure = true;
  });

  if (notSecure) return next();

  if (token) {
    return verifyToken(token).then((username) => {
      res.locals.username = username;
      next();
    })
      .catch(error => next(error));
  }
  return next(new AuthenticationError('No security token was passed'));
});


app.use('/user', user);
app.use('/search', search);
app.use('/posts', posts);
app.use('/feed', feed);


const resultHandling = (req, res, next) => {
  if (res.locals.result) {
    res.status(200).send({ ok: true, result: res.locals.result });
  } else {
    res.status(200).send({ ok: true });
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
  console.log(stackTrace);
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
