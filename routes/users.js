var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// when sign up, check whether a user already exists
router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    // if the user with this name already exists
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  })
});

// when a user tryies to log in, first we call passport.authenticate method,
// if it is successful, then next function will be executed
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You have successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
  // if a session exists, means a user has logged in
  if (req.session) {
    // the session is destroied, remove the session information from a server side, so the session is not valid
    req.session.destroy();
    // tell a client to remove cookie from the client side
    res.clearCookie('session-id');
    // redirect a user to the home page
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
