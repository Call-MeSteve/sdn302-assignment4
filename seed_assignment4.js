require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const User = require('./models/user');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/SimpleQuiz';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB SimpleQuiz for seeding...');

    await Quiz.deleteMany({});
    await Question.deleteMany({});

    const admin = await User.findOne({ username: 'Mary' }) || await User.findOne({ admin: true });
    const authorId = admin ? admin._id : null;

    const questionsData = [
      {
        text: 'What is the capital of Germany?',
        options: ['Paris', 'London', 'Berlin', 'Madrid'],
        correctAnswerIndex: 2,
        author: authorId
      },
      {
        text: 'Who developed the theory of relativity?',
        options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'],
        correctAnswerIndex: 0,
        author: authorId
      },
      {
        text: 'What is the symbol for iron on the periodic table?',
        options: ['Fe', 'I', 'Au', 'Ag'],
        correctAnswerIndex: 0,
        author: authorId
      },
      {
        text: 'What is the capital of France?',
        options: ['Paris', 'London', 'Berlin', 'Madrid'],
        correctAnswerIndex: 0,
        author: authorId
      },
      {
        text: 'What is the capital of England?',
        options: ['Paris', 'London', 'Berlin', 'Madrid'],
        correctAnswerIndex: 1,
        author: authorId
      }
    ];

    const createdQuestions = await Question.insertMany(questionsData);
    console.log('Created ' + createdQuestions.length + ' sample questions matching Assignment 4 screenshots.');

    const quiz1 = await Quiz.create({
      title: 'General Knowledge Quiz',
      description: 'Take this quiz to test your general knowledge!',
      questions: createdQuestions.map(q => q._id)
    });

    console.log('Created Quiz: ' + quiz1.title + ' with ' + quiz1.questions.length + ' questions.');
    await mongoose.disconnect();
    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();