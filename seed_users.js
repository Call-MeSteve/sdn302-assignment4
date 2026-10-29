require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Question = require('./models/Question');
const connectDB = require('./config/db');

async function seed() {
  await connectDB();
  console.log('--- SEEDING TAI KHOAN MAU CHO ASSIGNMENT 3 ---');

  // Xoa cac tai khoan demo cu neu co
  await User.deleteMany({ username: { $in: ['admin', 'Mary', 'John', 'author2', 'user10'] } });

  // 1. Tao tai khoan Admin mac dinh
  const admin = new User({ username: 'admin', admin: true });
  await User.register(admin, 'admin123');
  console.log('? Tao tai khoan Admin: username="admin", password="admin123" (admin: true)');

  // 2. Tao tai khoan Mary khop voi Postman cua ban
  const Mary = new User({ username: 'Mary', admin: true });
  await User.register(Mary, '123');
  console.log('? Tao tai khoan Mary: username="Mary", password="123" (admin: true)');

  // 3. Tao tai khoan Author 1
  const John = new User({ username: 'John', admin: false });
  await User.register(John, '123');
  console.log('? Tao tai khoan Author 1: username="John", password="123" (admin: false)');

  // 4. Tao tai khoan Author 2
  const author2 = new User({ username: 'author2', admin: false });
  await User.register(author2, '123');
  console.log('? Tao tai khoan Author 2: username="author2", password="123" (admin: false)');

  // Gan author vao cac cau hoi neu chua co
  const questionsWithoutAuthor = await Question.find({ author: { $exists: false } });
  if (questionsWithoutAuthor.length > 0) {
    for (let i = 0; i < questionsWithoutAuthor.length; i++) {
      questionsWithoutAuthor[i].author = (i % 2 === 0) ? John._id : author2._id;
      await questionsWithoutAuthor[i].save();
    }
    console.log(`? Da cap nhat tac gia cho ${questionsWithoutAuthor.length} cau hoi.`);
  }

  console.log('\n--- SEED HOAN TAT THANH CONG! ---');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Loi khi seed:', err);
  process.exit(1);
});
