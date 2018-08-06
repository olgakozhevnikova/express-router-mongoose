var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// when sign up, check whether a user already exists
router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    // if the user with this name already exists
    if (user != null) {
      var err = new Error('User ' + req.body.username + ' exists');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      });
    }
  })
  // the above promise returns the new created user,
  // handle the response in the next then()
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
  if(!req.session.user) {
    var authHeader = req.headers.authorization;

    // if authorization header is null, means that a user didn't provide login and password information
    if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    // extract authorization header:
    // base64 is encoding,
    // after spliting we get an array, the 2nd element of the array contains base64 encoded string, that we use
    // convert it to the string and then again split, to separate user name from password by :
    var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];

    User.findOne({username: username})
    .then((user) => {
      // if default username and password match the request
      if (user === null) {
        var err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if (user.password !== password) {
        var err = new Error('Your password is incorrect!');
        err.status = 403;
        return next(err);
      }
      else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!')
      }
    })
    .catch((err) => next(err));
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
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
