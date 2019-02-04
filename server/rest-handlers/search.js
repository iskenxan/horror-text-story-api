import express from 'express';
import { InvalidArgumentError } from '../utils/errors';
import { searchForUsers, searchSuggested } from '../firebase/search';


const search = express.Router();

search.post('/users', (req, res, next) => {
  const { query } = req.body;

  if (!query) {
    return next(new InvalidArgumentError('\'query\' cannot be empty', 401));
  }

  searchForUsers(query).then((resultArray) => {
    const result = {};
    resultArray.forEach((user) => {
      result[user.username] = user;
    });

    res.locals.result = result;
    return next();
  })
    .catch(error => next(error));
});


search.post('/suggested', (req, res, next) => {
  searchSuggested()
    .then((result) => {
      res.locals.result = result;
      return next();
    });
});

module.exports = search;
