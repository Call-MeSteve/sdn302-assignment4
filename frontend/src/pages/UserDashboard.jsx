import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mt-4">
        {activeTab === 'home' && (
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
        )}

        {activeTab === 'article' && (
          <div className="card p-4 border rounded shadow-sm">
            <h4 className="fw-bold mb-3">Featured Articles</h4>
            <div className="list-group">
              <div className="list-group-item list-group-item-action">
                <h6 className="mb-1 fw-bold">Tips for General Knowledge Quizzes</h6>
                <p className="mb-1 text-secondary small">Explore scientific discoveries and geographic facts to excel in quizzes.</p>
              </div>
              <div className="list-group-item list-group-item-action">
                <h6 className="mb-1 fw-bold">World Capitals and History</h6>
                <p className="mb-1 text-secondary small">Comprehensive guide on European capitals and famous landmarks.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;