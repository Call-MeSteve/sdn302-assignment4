const express = require('express');
const quizRouter = express.Router();
const quizController = require('../controllers/quizController');
const authenticate = require('../authenticate');

// Task 3 (Assignment 1): GET /quizzes/:quizId/populate - Public cho bat ky ai
quizRouter.route('/:quizId/populate')
  .get(quizController.getQuizPopulateCapital);

// POST /quizzes/:quizId/question - Them 1 cau hoi vao Quiz (Chi Admin)
quizRouter.route('/:quizId/question')
  .post(authenticate.verifyUser, authenticate.verifyAdmin, quizController.addQuestionToQuiz);

// POST /quizzes/:quizId/questions - Them nhieu cau hoi vao Quiz (Chi Admin)
quizRouter.route('/:quizId/questions')
  .post(authenticate.verifyUser, authenticate.verifyAdmin, quizController.addManyQuestionsToQuiz);

// DELETE /quizzes/:quizId/questions/:questionId - Xoa cau hoi khoi Quiz (Chi Admin)
quizRouter.route('/:quizId/questions/:questionId')
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteQuestionFromQuiz);

quizRouter.route('/:quizId/question/:questionId')
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteQuestionFromQuiz);

// Task 2: /quizzes - GET public, POST & DELETE chi Admin
quizRouter.route('/')
  .get(quizController.getAllQuizzes)
  .post(authenticate.verifyUser, authenticate.verifyAdmin, quizController.createQuiz)
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteAllQuizzes);

// Task 2: /quizzes/:quizId - GET public, PUT & DELETE chi Admin
quizRouter.route('/:quizId')
  .get(quizController.getQuizById)
  .put(authenticate.verifyUser, authenticate.verifyAdmin, quizController.updateQuizById)
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteQuizById);

module.exports = quizRouter;
