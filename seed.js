require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/SimpleQuiz';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB SimpleQuiz for seeding...');

    // Clear existing data
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    console.log('Cleared existing Quiz and Question collections.');

    // Create sample question
    const q1 = await Question.create({
      text: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
      keywords: ['geography', 'capital', 'france'],
      correctAnswerIndex: 0,
    });

    const q2 = await Question.create({
      text: 'What is the largest planet in our solar system?',
      options: ['Earth', 'Jupiter', 'Mars', 'Saturn'],
      keywords: ['space', 'science', 'planets'],
      correctAnswerIndex: 1,
    });

    // Create sample quiz referencing q1
    const quiz1 = await Quiz.create({
      title: 'Science Quiz',
      description: 'Test your knowledge of scientific concepts!',
      questions: [q1._id, q2._id],
    });

    const quiz2 = await Quiz.create({
      title: 'History Quiz',
      description: 'Test your knowledge of historical concepts!',
      questions: [],
    });

    console.log('Sample Data Seeded Successfully!');
    console.log(`- Created Quiz: "${quiz1.title}" (ID: ${quiz1._id}) with ${quiz1.questions.length} questions`);
    console.log(`- Created Quiz: "${quiz2.title}" (ID: ${quiz2._id})`);
    console.log(`- Created Question: "${q1.text}" (ID: ${q1._id})`);
    console.log(`- Created Question: "${q2.text}" (ID: ${q2._id})`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected. Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
