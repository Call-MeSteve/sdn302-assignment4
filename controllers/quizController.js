const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// GET /quizzes - Lay danh sach tat ca bai quiz va populate questions
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({}).populate('questions');
    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
};

// GET /quizzes/:quizId - Lay bai quiz theo ID
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    res.status(200).json(quiz);
  } catch (error) {
    next(error);
  }
};

// POST /quizzes - Tao moi bai quiz (Chi Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const newQuiz = await Quiz.create(req.body);
    res.status(201).json({
      message: `Added quiz with id: ${newQuiz._id} successfully.`,
      quiz: newQuiz,
      _id: newQuiz._id
    });
  } catch (error) {
    next(error);
  }
};

// PUT /quizzes/:quizId - Cap nhat bai quiz theo ID
exports.updateQuizById = async (req, res, next) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    ).populate('questions');
    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(updatedQuiz);
  } catch (error) {
    next(error);
  }
};

// DELETE /quizzes/:quizId - Xoa bai quiz theo ID
exports.deleteQuizById = async (req, res, next) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(deletedQuiz);
  } catch (error) {
    next(error);
  }
};

// DELETE /quizzes - Xoa tat ca bai quiz
exports.deleteAllQuizzes = async (req, res, next) => {
  try {
    const result = await Quiz.deleteMany({});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /quizzes/:quizId/populate - Populate questions co chua chu "capital"
exports.getQuizPopulateCapital = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: 'questions',
      match: { text: { $regex: 'capital', $options: 'i' } },
    });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    next(error);
  }
};

// POST /quizzes/:quizId/question - Them cau hoi vao Quiz (Ho tro ca truyen questionId hoac tao moi cau hoi)
exports.addQuestionToQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Truong hop 1: Truyen { questionId: "..." } tu Postman
    if (req.body.questionId) {
      const existingQuestion = await Question.findById(req.body.questionId);
      if (!existingQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      const alreadyInQuiz = quiz.questions.some(qId => qId.toString() === existingQuestion._id.toString());
      if (!alreadyInQuiz) {
        quiz.questions.push(existingQuestion._id);
        await quiz.save();
      }

      const updatedQuiz = await Quiz.findById(req.params.quizId).populate('questions');
      return res.status(200).json({
        message: 'Question added to quiz successfully',
        quiz: updatedQuiz
      });
    }

    // Truong hop 2: Truyen body noi dung cau hoi moi { text, options, correctAnswerIndex }
    if (req.user) {
      req.body.author = req.user._id;
    }
    const newQuestion = await Question.create(req.body);
    quiz.questions.push(newQuestion._id);
    await quiz.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    next(error);
  }
};

// POST /quizzes/:quizId/questions - Them nhieu cau hoi
exports.addManyQuestionsToQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const data = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        message: 'Request body must be a non-empty array of questions',
      });
    }

    // Neu la mang cac chuoi ID
    if (typeof data[0] === 'string') {
      quiz.questions.push(...data);
      await quiz.save();
      return res.status(200).json({ message: 'Questions added successfully.' });
    }

    // Neu la mang object cau hoi moi
    if (req.user) {
      data.forEach(q => q.author = req.user._id);
    }
    const insertedQuestions = await Question.insertMany(data);
    const questionIds = insertedQuestions.map((q) => q._id);
    quiz.questions.push(...questionIds);
    await quiz.save();

    res.status(200).json({
      message: 'Questions added successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /quizzes/:quizId/questions/:questionId - Go cau hoi khoi Quiz
exports.deleteQuestionFromQuiz = async (req, res, next) => {
  try {
    const { quizId, questionId } = req.params;
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $pull: { questions: questionId } },
      { returnDocument: 'after' }
    ).populate('questions');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ message: `Removed question with id: ${questionId} from quiz.` });
  } catch (error) {
    next(error);
  }
};
