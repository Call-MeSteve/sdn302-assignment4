import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import { fetchQuestions, selectOption, submitAnswer, restartQuiz } from '../redux/quizSlice';

const TakeQuizPage = () => {
  const dispatch = useDispatch();
  const { questions, loading, error, currentQuestionIndex, selectedOptionIndex, score, quizCompleted } = useSelector(
    (state) => state.quiz
  );

  useEffect(() => {
    if (questions.length === 0) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, questions.length]);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-secondary">Loading questions...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {!loading && questions.length === 0 && !error && (
          <div className="text-center py-5">
            <h5 className="text-secondary">No questions available at the moment.</h5>
          </div>
        )}

        {/* State 1: Answering Quiz (Screenshot 3) */}
        {!loading && questions.length > 0 && !quizCompleted && currentQuestion && (
          <div className="text-center mx-auto" style={{ maxWidth: '500px' }}>
            <h3 className="fw-bold mb-4">Quiz</h3>
            <h4 className="fw-medium mb-4">{currentQuestion.text}</h4>

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

        {/* State 2: Quiz Completed (Screenshot 4) */}
        {!loading && quizCompleted && (
          <div className="text-center py-5 mx-auto" style={{ maxWidth: '400px' }}>
            <h2 className="fw-bold mb-3">Quiz Completed</h2>
            <p className="fs-5 text-secondary mb-4">Your score: {score} / {questions.length}</p>
            <button
              className="btn btn-primary px-4 py-2"
              onClick={() => dispatch(restartQuiz())}
            >
              Restart Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuizPage;