import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion } from '../redux/quizSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { questions, loading } = useSelector((state) => state.quiz);

  const [activeTab, setActiveTab] = useState('questions');

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchQuestions());
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

        {activeTab === 'articles' && (
          <div className="card p-4 border rounded shadow-sm">
            <h4 className="fw-bold mb-3">Manage Articles</h4>
            <p className="text-secondary">Articles management interface for administrators.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;