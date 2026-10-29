const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const Question = require('./models/Question');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const secretKey = process.env.SECRET_KEY || '12345-67890-09876-54321';

// Thoi han Token la 24h (86400s) de thoai mai test khong bi het han
exports.getToken = function(user) {
  return jwt.sign(user, secretKey, { expiresIn: '24h' });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findOne({ _id: jwt_payload._id });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// Middleware verifyUser tra ve JSON 100% khi that bai
exports.verifyUser = function(req, res, next) {
  passport.authenticate('jwt', { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      const errMsg = info && info.message ? info.message : 'Unauthorized';
      return res.status(401).json({
        success: false,
        status: 401,
        message: errMsg,
        error: 'Unauthorized'
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

exports.verifyAdmin = function(req, res, next) {
  if (req.user && req.user.admin) {
    return next();
  } else {
    const err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  }
};

const verifyAuthorMiddleware = async function(req, res, next) {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      const err = new Error('Question not found');
      err.status = 404;
      return next(err);
    }
    // Assignment 4: Admin luon duoc phep CRUD bat ky question nao
    if (req.user && req.user.admin) {
      return next();
    }
    if (!question.author) {
      const err = new Error("You are not the author of this question");
      err.status = 403;
      return next(err);
    }
    if (question.author.equals(req.user._id)) {
      return next();
    } else {
      const err = new Error("You are not the author of this question");
      err.status = 403;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

exports.verifyAuthor = verifyAuthorMiddleware;
exports.vertifyAuthor = verifyAuthorMiddleware;
