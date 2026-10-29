require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');

const connectDB = require('./config/db');

// Khoi chay ket noi MongoDB
connectDB();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var quizRouter = require('./routes/quizRouter');
var questionRouter = require('./routes/questionRouter');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

// Dang ky cac Router
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/quizzes', quizRouter);
app.use('/questions', questionRouter);
app.use('/question', questionRouter); // Alias

// Bat loi 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function(err, req, res, next) {
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ID format for ${err.path}: ${err.value}`,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors: messages,
    });
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
