import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import {
  fetchQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  fetchQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestionToQuiz,
  removeQuestionFromQuiz
} from '../redux/quizSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { questions, quizzes, loading, quizLoading } = useSelector((state) => state.quiz);

  const [activeTab, setActiveTab] = useState('questions');

  // Question Form states
  const [editingId, setEditingId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [formError, setFormError] = useState('');

  // Quiz Form states
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [selectedQuestionToAdd, setSelectedQuestionToAdd] = useState({});
  const [quizFormError, setQuizFormError] = useState('');

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setFormError('');
  };

  const handleEditClick = (q) => {
    setEditingId(q._id);
    setQuestionText(q.text);
    const opts = q.options && q.options.length >= 4 ? q.options.slice(0, 4) : ['', '', '', ''];
    setOptions(opts);
    setCorrectAnswerIndex(q.correctAnswerIndex ?? 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      dispatch(deleteQuestion(id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!questionText.trim()) {
      setFormError('Please enter question text');
      return;
    }

    const filteredOptions = options.map(o => o.trim());
    if (filteredOptions.some(o => !o)) {
      setFormError('Please provide all 4 options');
      return;
    }

    const payload = {
      text: questionText.trim(),
      options: filteredOptions,
      correctAnswerIndex: Number(correctAnswerIndex)
    };

    if (editingId) {
      await dispatch(updateQuestion({ id: editingId, questionData: payload }));
    } else {
      await dispatch(addQuestion(payload));
    }

    resetForm();
  };

  // Quiz Handlers
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setQuizFormError('');

    if (!quizTitle.trim()) {
      setQuizFormError('Please enter Quiz title');
      return;
    }

    if (editingQuizId) {
      await dispatch(updateQuiz({ id: editingQuizId, quizData: { title: quizTitle.trim(), description: quizDescription.trim() } }));
    } else {
      await dispatch(createQuiz({ title: quizTitle.trim(), description: quizDescription.trim() }));
    }

    setEditingQuizId(null);
    setQuizTitle('');
    setQuizDescription('');
  };

  const handleEditQuiz = (q) => {
    setEditingQuizId(q._id);
    setQuizTitle(q.title);
    setQuizDescription(q.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuiz = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      dispatch(deleteQuiz(id));
    }
  };

  const handleAddQuestionToQuiz = async (quizId) => {
    const qId = selectedQuestionToAdd[quizId];
    if (!qId) return;
    await dispatch(addQuestionToQuiz({ quizId, questionId: qId }));
    setSelectedQuestionToAdd({ ...selectedQuestionToAdd, [quizId]: '' });
  };

  const handleRemoveQuestionFromQuiz = async (quizId, questionId) => {
    if (window.confirm('Remove this question from the quiz?')) {
      await dispatch(removeQuestionFromQuiz({ quizId, questionId }));
    }
  };

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mt-4 mb-5" style={{ maxWidth: '750px' }}>
        {activeTab === 'questions' && (
          <>
            {/* Form Section (Screenshot 7) */}
            <div className="card p-4 border rounded shadow-sm mb-4">
              <h4 className="fw-bold mb-4">Questions</h4>

              {formError && (
                <div className="alert alert-danger py-2 small">{formError}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label small text-secondary">
                    Question Text:
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label small text-secondary">
                    Options:
                  </label>
                  <div className="col-sm-9">
                    {options.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        className="form-control mb-2"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="row mb-4 align-items-center">
                  <label className="col-sm-3 col-form-label small text-secondary">
                    Correct Answer Index:
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="3"
                      value={correctAnswerIndex}
                      onChange={(e) => setCorrectAnswerIndex(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-4">
                    {editingId ? 'Update Question' : 'Add Question'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Questions List Section (Screenshot 7) */}
            {loading && questions.length === 0 ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {questions.map((q) => (
                  <div key={q._id} className="card p-4 border rounded shadow-sm">
                    <h5 className="fw-bold mb-2">{q.text}</h5>
                    <ul className="mb-3 text-secondary ps-4">
                      {q.options?.map((opt, idx) => (
                        <li key={idx}>
                          {opt} {idx === q.correctAnswerIndex && <span className="badge bg-success-subtle text-success small ms-2">Correct</span>}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <button
                        className="btn btn-warning btn-sm me-2 text-dark px-3 fw-medium"
                        onClick={() => handleEditClick(q)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm px-3 fw-medium"
                        onClick={() => handleDeleteClick(q._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'quizzes' && (
          <>
            {/* Quizzes Form Section matching screenshot */}
            <h2 className="fw-bold mb-4">Quizzes</h2>

            <div className="card p-4 border rounded shadow-sm mb-4">
              {quizFormError && (
                <div className="alert alert-danger py-2 small">{quizFormError}</div>
              )}

              <form onSubmit={handleQuizSubmit}>
                <div className="mb-3">
                  <label className="form-label text-dark fw-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder=""
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-dark fw-medium mb-1">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder=""
                    required
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-4">
                    {editingQuizId ? 'Update Quiz' : 'Add Quiz'}
                  </button>
                  {editingQuizId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3"
                      onClick={() => {
                        setEditingQuizId(null);
                        setQuizTitle('');
                        setQuizDescription('');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Quizzes List Section */}
            {quizLoading && quizzes.length === 0 ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                No Quizzes created yet. Create your first Quiz above!
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="card p-4 border rounded shadow-sm">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-1">{quiz.title}</h5>
                        <p className="text-secondary small mb-2">{quiz.description}</p>
                      </div>
                      <span className="badge bg-primary px-3 py-2">
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>

                    {/* Questions in this Quiz */}
                    {quiz.questions && quiz.questions.length > 0 && (
                      <div className="bg-light p-3 rounded mb-3 border">
                        <h6 className="fw-semibold small text-secondary mb-2">Questions in this Quiz:</h6>
                        <ol className="mb-0 ps-3">
                          {quiz.questions.map((q, idx) => (
                            <li key={q._id || idx} className="small mb-1 d-flex justify-content-between align-items-center">
                              <span>{q.text || 'Question ' + (idx + 1)}</span>
                              <button
                                type="button"
                                className="btn btn-link text-danger p-0 ms-2 text-decoration-none small"
                                style={{ fontSize: '12px' }}
                                onClick={() => handleRemoveQuestionFromQuiz(quiz._id, q._id || q)}
                              >
                                &times; Remove
                              </button>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Add Question to this Quiz select */}
                    <div className="input-group input-group-sm mb-3" style={{ maxWidth: '480px' }}>
                      <select
                        className="form-select"
                        value={selectedQuestionToAdd[quiz._id] || ''}
                        onChange={(e) =>
                          setSelectedQuestionToAdd({
                            ...selectedQuestionToAdd,
                            [quiz._id]: e.target.value
                          })
                        }
                      >
                        <option value="">-- Choose question to add to Quiz --</option>
                        {questions
                          .filter((q) => !quiz.questions?.some((qq) => (qq._id || qq) === q._id))
                          .map((q) => (
                            <option key={q._id} value={q._id}>
                              {q.text}
                            </option>
                          ))}
                      </select>
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        disabled={!selectedQuestionToAdd[quiz._id]}
                        onClick={() => handleAddQuestionToQuiz(quiz._id)}
                      >
                        Add to Quiz
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div>
                      <button
                        className="btn btn-warning btn-sm me-2 text-dark px-3 fw-medium"
                        onClick={() => handleEditQuiz(quiz)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm px-3 fw-medium"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;