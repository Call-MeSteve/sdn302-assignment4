const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  {
    versionKey: '__v', // matches PDF output screenshot
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
