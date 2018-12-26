import express from 'express';
import { InvalidArgumentError } from '../utils/errors';
import { searchForUsers } from '../firebase/search';


const search = express.Router();

search.post('/users', (req, res, next) => {
  const { query } = req.body;

  if (!query) {
    return next(new InvalidArgumentError('\'query\' cannot be empty', 401));
  }

  searchForUsers(query).then((resultArray) => {
    res.locals.result = resultArray;
    return next();
  })
    .catch(error => next(error));
});

module.exports = search;
