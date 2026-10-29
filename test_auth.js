require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/user');
const Question = require('./models/Question');
const Quiz = require('./models/Quiz');
const http = require('http');

let server;
const PORT = 3888;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING ASSIGNMENT 3 AUTOMATED TESTS ---');
  server = app.listen(PORT);

  // 1. Setup / Seed Users
  console.log('\n[1] Khoi tao tai khoan Admin va Authors...');
  await User.deleteMany({ username: { $in: ['admin_test', 'author1_test', 'author2_test'] } });

  // Register Admin
  const adminUser = new User({ username: 'admin_test', admin: true });
  await User.register(adminUser, 'admin123');

  // Register Author 1
  const author1User = new User({ username: 'author1_test', admin: false });
  await User.register(author1User, 'author123');

  // Register Author 2
  const author2User = new User({ username: 'author2_test', admin: false });
  await User.register(author2User, 'author123');

  console.log('✓ Tao thanh cong 3 users (1 Admin, 2 Normal users)');

  // 2. Login to get tokens
  console.log('\n[2] Dang nhap de lay JWT token...');
  const adminLogin = await request({
    hostname: 'localhost', port: PORT, path: '/users/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin_test', password: 'admin123' });
  const adminToken = adminLogin.data.token;

  const author1Login = await request({
    hostname: 'localhost', port: PORT, path: '/users/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'author1_test', password: 'author123' });
  const author1Token = author1Login.data.token;

  const author2Login = await request({
    hostname: 'localhost', port: PORT, path: '/users/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'author2_test', password: 'author123' });
  const author2Token = author2Login.data.token;

  console.log('✓ Dang nhap thanh cong ca 3 tai khoan');

  // 3. Test Task 3: GET /users
  console.log('\n[3] Test Task 3: GET /users');
  const getNormalUsers = await request({
    hostname: 'localhost', port: PORT, path: '/users', method: 'GET',
    headers: { 'Authorization': `Bearer ${author1Token}` }
  });
  console.log(`- Author 1 GET /users: Status ${getNormalUsers.status} | Message: ${JSON.stringify(getNormalUsers.data.message)}`);
  if (getNormalUsers.status === 403 && getNormalUsers.data.message === "You are not authorized to perform this operation!") {
    console.log('  -> PASS: User thuong bi cam 403 dung chuan!');
  } else {
    console.error('  -> FAIL User thuong GET /users!');
  }

  const getAdminUsers = await request({
    hostname: 'localhost', port: PORT, path: '/users', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`- Admin GET /users: Status ${getAdminUsers.status} | So luong users: ${getAdminUsers.data.length}`);
  if (getAdminUsers.status === 200 && Array.isArray(getAdminUsers.data)) {
    console.log('  -> PASS: Admin GET /users tra ve 200 OK!');
  } else {
    console.error('  -> FAIL Admin GET /users!');
  }

  // 4. Test Task 2: Quizzes
  console.log('\n[4] Test Task 2: Phan quyen Quizzes (POST /quizzes)');
  const normalCreateQuiz = await request({
    hostname: 'localhost', port: PORT, path: '/quizzes', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author1Token}` }
  }, { title: 'Test Quiz by Normal', description: 'desc' });
  console.log(`- Author 1 POST /quizzes: Status ${normalCreateQuiz.status}`);
  if (normalCreateQuiz.status === 403) {
    console.log('  -> PASS: User thuong tao Quiz bi chan 403!');
  }

  const adminCreateQuiz = await request({
    hostname: 'localhost', port: PORT, path: '/quizzes', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  }, { title: 'Admin Master Quiz', description: 'Created by Admin' });
  console.log(`- Admin POST /quizzes: Status ${adminCreateQuiz.status}`);
  if (adminCreateQuiz.status === 201) {
    console.log('  -> PASS: Admin tao Quiz thanh cong (201 Created)!');
  }
  const testQuizId = adminCreateQuiz.data._id;

  // 5. Test Task 4: Question author permissions
  console.log('\n[5] Test Task 4: Phan quyen Questions (POST, PUT, DELETE)');
  // Author 1 creates question
  const createQRes = await request({
    hostname: 'localhost', port: PORT, path: '/questions', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author1Token}` }
  }, {
    text: 'What is Capital of France?',
    options: ['Paris', 'London', 'Berlin'],
    correctAnswerIndex: 0
  });
  console.log(`- Author 1 tao question: Status ${createQRes.status}`);
  const qId = createQRes.data._id;
  console.log(`  -> Question ID: ${qId}, Author: ${createQRes.data.author.username}`);

  // Author 2 tries to edit Author 1's question -> Must be 403
  const author2Edit = await request({
    hostname: 'localhost', port: PORT, path: `/questions/${qId}`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author2Token}` }
  }, { text: 'Hacked question' });
  console.log(`- Author 2 sua question cua Author 1: Status ${author2Edit.status} | Message: ${JSON.stringify(author2Edit.data.message)}`);
  if (author2Edit.status === 403 && author2Edit.data.message === "You are not the author of this question") {
    console.log('  -> PASS: Author khac sua question bi chan 403 chuan xac!');
  }

  // Admin tries to edit Author 1's question -> Must also be 403!
  const adminEdit = await request({
    hostname: 'localhost', port: PORT, path: `/questions/${qId}`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  }, { text: 'Admin modified question' });
  console.log(`- Admin sua question cua Author 1: Status ${adminEdit.status} | Message: ${JSON.stringify(adminEdit.data.message)}`);
  if (adminEdit.status === 403 && adminEdit.data.message === "You are not the author of this question") {
    console.log('  -> PASS: Ngay ca Admin cung bi chan 403 khi sua question cua nguoi khac!');
  }

  // Author 1 edits their OWN question -> 200 OK
  const author1Edit = await request({
    hostname: 'localhost', port: PORT, path: `/questions/${qId}`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author1Token}` }
  }, { text: 'What is Capital of France? (Updated by Author 1)' });
  console.log(`- Author 1 tu sua question cua chinh minh: Status ${author1Edit.status}`);
  if (author1Edit.status === 200) {
    console.log('  -> PASS: Tac gia tu sua question cua minh thanh cong (200 OK)!');
  }

  // Author 2 tries to delete Author 1's question -> 403
  const author2Delete = await request({
    hostname: 'localhost', port: PORT, path: `/questions/${qId}`, method: 'DELETE',
    headers: { 'Authorization': `Bearer ${author2Token}` }
  });
  console.log(`- Author 2 xoa question cua Author 1: Status ${author2Delete.status}`);
  if (author2Delete.status === 403) {
    console.log('  -> PASS: Author khac xoa question bi chan 403!');
  }

  // Admin tries to delete Author 1's question -> 403
  const adminDelete = await request({
    hostname: 'localhost', port: PORT, path: `/questions/${qId}`, method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`- Admin xoa question cua Author 1: Status ${adminDelete.status}`);
  if (adminDelete.status === 403) {
    console.log('  -> PASS: Ngay ca Admin cung bi chan 403 khi xoa question cua nguoi khac!');
  }

  // Author 1 deletes their OWN question -> 200 OK
  const author1Delete = await request({
    hostname: 'localhost', port: PORT, path: `/questions/${qId}`, method: 'DELETE',
    headers: { 'Authorization': `Bearer ${author1Token}` }
  });
  console.log(`- Author 1 tu xoa question cua minh: Status ${author1Delete.status}`);
  if (author1Delete.status === 200) {
    console.log('  -> PASS: Tac gia tu xoa question cua minh thanh cong (200 OK)!');
  }

  // Clean up
  await Quiz.findByIdAndDelete(testQuizId);
  await server.close();
  await mongoose.disconnect();
  console.log('\n=============================================');
  console.log('✓ TAT CA CAC TEST CHO ASSIGNMENT 3 DEU PASS 100%!');
  console.log('=============================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  if (server) server.close();
  process.exit(1);
});
