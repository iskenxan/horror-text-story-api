const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
  res.send('login');
});


router.post('/signup', (req, res) => {
  res.send('signup');
});


module.exports = router;
