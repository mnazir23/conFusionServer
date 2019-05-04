var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log('DOES VERIY USER COMES HERE???');
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

// adding verifyAdmin method to verify if a user is an admin or not
exports.verifyAdmin = function verifyAdmin(req, res, next) {
    if (req.user.admin == true) {
        console.log('Congrats! You are an admin');
        return next();
    }
    else if (req.user.admin == false) {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
    else {
        err = new Error('Admin Verification Failed!');
        err.status = 500;
        return next(err);
    }
}
