const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    options: {
      type: [String],
      required: [true, 'Options array is required'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Options must contain at least one option',
      },
    },
    keywords: {
      type: [String],
      default: [],
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, 'correctAnswerIndex is required'],
    },
  },
  {
    versionKey: '__v',
  }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
