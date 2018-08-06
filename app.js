var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected correctly to the srever!');
}, (err) => {
  console.log(err);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// pass the secret key to the cookieParser()
app.use(cookieParser('12345-67890-09876-54321'));

// Authentication function
function auth(req, res, next) {
  console.log(req.signedCookies);

  //if the signed cookie doesn't contain the user property,
  // the a user has to use an authorization header for authorization
  if(!req.signedCookies.user) {
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

    // if default username and password match the request
    if (username === 'admin' && password === 'password') {
      // include cookie with name 'user' and value 'admin'
      res.cookie('user', 'admin', {signed: true})
      // this next() means that the request is passed to the next set of middleware (to below app.use())
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }
  // if the cookie exists and the user property is defined
  else {
    // if signedCookies contains the correct information,
    if(req.signedCookies.user === 'admin') {
      // then allow the request to pass through
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
}

// Authentication
app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
