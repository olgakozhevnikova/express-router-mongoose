var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
// provide JSON Web Token based strategy for passport module configuration
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
	// create json web token,
	// expiresIn tells fot how long json token will be valid,
	// after 3600 sec (or 1 hour) a user has to update the token
	return jwt.sign(user, config.secretKey,
		{expiresIn: 3600});
};

var opts = {};
// specify how web token should be extracted from a request message
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// done is a callback function through which I pass the information to passport,
// that will be used for loading things in the request message
exports.jwtPassport = passport.use(new JwtStrategy(opts,
	(jwt_payload, done) => {
		console.log('JWT payload: ', jwt_payload); // to see what is inside jwt_payload
		User.findOne({_id: jwt_payload._id}, (err, user) => {
			// if there is an error,
			if (err) {
				// then return done(), passed by passport
				// done() takes 3 parameters:
				// 1st parameter (mandatory) - error
				// 2nd parameter (optional) - user
				// 3rd parameter (optional) - any info
				return done(err, false);
			}
			// if user exists
			else if (user) {
				// error is null and user exists
				return done(null, user);
			}
			else {
				return done(null, false);
			}
		})
}));

// use this function to verify an incoming user,
// to authenticate it uses 'jwt' strategy, that was just configured,
// session: false means that I am not going to create any session in this case
// Every time I want to verify a user, I can call verifyUser
exports.verifyUser = passport.authenticate('jwt', {session: false});
