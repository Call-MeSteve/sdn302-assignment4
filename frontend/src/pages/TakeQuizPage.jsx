import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import {
  fetchQuizzes,
  startSelectedQuiz,
  exitQuiz,
  selectOption,
  submitAnswer,
  restartQuiz
} from '../redux/quizSlice';

const TakeQuizPage = () => {
  const dispatch = useDispatch();
  const {
    quizzes,
    selectedQuiz,
    questions,
    quizLoading,
    error,
    currentQuestionIndex,
    selectedOptionIndex,
    score,
    quizCompleted
  } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const currentQuestion = questions && questions[currentQuestionIndex];

  return (
    <div>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: '950px' }}>
        {quizLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-secondary">Loading quizzes...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {/* View 1: Quizzes List (matching user screenshot) */}
        {!selectedQuiz && !quizLoading && (
          <div>
            <h2 className="fw-bold mb-4">Quizzes</h2>

            {quizzes.length === 0 ? (
              <div className="card p-5 text-center border rounded">
                <h5 className="text-secondary mb-0">No quizzes available at the moment.</h5>
              </div>
            ) : (
              <div className="card border rounded bg-white shadow-sm overflow-hidden">
                {quizzes.map((quiz, index) => {
                  const qCount = quiz.questions?.length || 0;
                  return (
                    <div
                      key={quiz._id || index}
                      className={`p-4 d-flex justify-content-between align-items-center ${
                        index !== quizzes.length - 1 ? 'border-bottom' : ''
                      }`}
                    >
                      <div>
                        <h4 className="fw-bold mb-1 text-dark">{quiz.title}</h4>
                        <p className="text-secondary mb-1">{quiz.description}</p>
                        <div className="text-secondary small">{qCount} questions</div>
                      </div>

                      <div>
                        {qCount > 0 ? (
                          <button
                            className="btn btn-primary px-4 py-2 fw-medium"
                            onClick={() => dispatch(startSelectedQuiz(quiz))}
                          >
                            Start Quiz
                          </button>
                        ) : (
                          <span className="text-secondary fw-medium pe-2">No questions</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View 2: Taking Quiz Question */}
        {selectedQuiz && !quizCompleted && currentQuestion && (
          <div className="mx-auto" style={{ maxWidth: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => dispatch(exitQuiz())}
              >
                &larr; Back to Quizzes
              </button>
              <span className="badge bg-secondary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="text-center mb-4">
              <h3 className="fw-bold mb-1">{selectedQuiz.title}</h3>
              <p className="text-muted">{selectedQuiz.description}</p>
              <h4 className="fw-medium mt-4">{currentQuestion.text}</h4>
            </div>

            <div className="text-start mb-4 ps-4">
              {currentQuestion.options?.map((option, idx) => (
                <div className="form-check mb-2" key={idx}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="quizOption"
                    id={`option-${idx}`}
                    checked={selectedOptionIndex === idx}
                    onChange={() => dispatch(selectOption(idx))}
                  />
                  <label className="form-check-label ps-1" htmlFor={`option-${idx}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <div className="text-start ps-4">
              <button
                className="btn btn-primary px-4 py-2"
                onClick={() => dispatch(submitAnswer())}
                disabled={selectedOptionIndex === null}
              >
                Submit Answer
              </button>
            </div>
          </div>
        )}

        {/* View 3: Quiz Completed */}
        {selectedQuiz && quizCompleted && (
          <div className="text-center py-5 mx-auto" style={{ maxWidth: '400px' }}>
            <h2 className="fw-bold mb-3">Quiz Completed</h2>
            <p className="fs-5 text-secondary mb-4">
              Your score: {score} / {questions.length}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-primary px-4 py-2"
                onClick={() => dispatch(restartQuiz())}
              >
                Restart Quiz
              </button>
              <button
                className="btn btn-outline-secondary px-4 py-2"
                onClick={() => dispatch(exitQuiz())}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuizPage;
