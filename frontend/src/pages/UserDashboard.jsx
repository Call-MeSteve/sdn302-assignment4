import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <div className="card p-4 border rounded shadow-sm text-center">
          <h4 className="fw-bold mb-3">Welcome to SimpleQuiz App!</h4>
          <p className="text-secondary mb-4">
            Hello <strong>{user?.username}</strong>! You can now take available quizzes to test your knowledge.
          </p>
          <div>
            <Link to="/dashboard/quiz" className="btn btn-primary px-4 py-2">
              Click here to start Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
