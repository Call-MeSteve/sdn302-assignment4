const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// GET /questions - Lay danh sach tat ca cau hoi (Public)
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({}).populate('author', 'username admin');
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

// GET /questions/:questionId - Lay thong tin cau hoi theo ID (Public)
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId).populate('author', 'username admin');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

// POST /questions - Tao moi cau hoi (Tu dong luu author = req.user._id)
exports.createQuestion = async (req, res, next) => {
  try {
    if (req.user) {
      req.body.author = req.user._id;
    }
    const newQuestion = await Question.create(req.body);
    const populatedQuestion = await Question.findById(newQuestion._id).populate('author', 'username admin');
    res.status(201).json(populatedQuestion);
  } catch (error) {
    next(error);
  }
};

// PUT /questions/:questionId - Cap nhat cau hoi theo ID (Chi tac gia)
exports.updateQuestionById = async (req, res, next) => {
  try {
    delete req.body.author;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.questionId,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    ).populate('author', 'username admin');

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

// DELETE /questions/:questionId - Xoa cau hoi theo ID (Chi tac gia)
exports.deleteQuestionById = async (req, res, next) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.questionId);
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Quiz.updateMany(
      { questions: req.params.questionId },
      { $pull: { questions: req.params.questionId } }
    );

    res.status(200).json(deletedQuestion);
  } catch (error) {
    next(error);
  }
};

// DELETE /questions - Xoa toan bo cau hoi (Chi Admin)
exports.deleteAllQuestions = async (req, res, next) => {
  try {
    const result = await Question.deleteMany({});
    await Quiz.updateMany({}, { $set: { questions: [] } });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
