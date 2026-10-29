const express = require('express');
const questionRouter = express.Router();
const questionController = require('../controllers/questionController');
const authenticate = require('../authenticate');

// /questions - GET Public, POST verifyUser, DELETE verifyUser + verifyAdmin
questionRouter.route('/')
  .get(questionController.getAllQuestions)
  .post(authenticate.verifyUser, questionController.createQuestion)
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, questionController.deleteAllQuestions);

// /questions/:questionId - GET Public, PUT & DELETE only for Author (Task 4)
questionRouter.route('/:questionId')
  .get(questionController.getQuestionById)
  .put(authenticate.verifyUser, authenticate.verifyAuthor, questionController.updateQuestionById)
  .delete(authenticate.verifyUser, authenticate.verifyAuthor, questionController.deleteQuestionById);

module.exports = questionRouter;
