import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logoutUser } from '../redux/authSlice';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="container mt-4 mb-4">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</h2>
        <span className="text-secondary fw-semibold">Welcome, {user?.username || 'User'}</span>
      </div>

      {/* Sub Menu bar */}
      <div className="bg-light p-2 rounded d-flex align-items-center gap-4 px-3 border">
        {isAdmin ? (
          <>
            <Link to="/admin" className="text-decoration-none text-dark fw-medium">Home</Link>
            <span 
              className={`text-decoration-none fw-medium ${activeTab === 'questions' ? 'text-primary fw-bold' : 'text-dark'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab && setActiveTab('questions')}
            >
              Manage Questions
            </span>
            <span 
              className={`text-decoration-none fw-medium ${activeTab === 'quizzes' ? 'text-primary fw-bold' : 'text-dark'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab && setActiveTab('quizzes')}
            >
              Manage Quizzes
            </span>
            <span 
              className="text-decoration-none text-dark fw-medium" 
              style={{ cursor: 'pointer' }} 
              onClick={handleLogout}
            >
              Logout
            </span>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-decoration-none text-dark fw-medium">Home</Link>
            <Link to="/dashboard/quiz" className="text-decoration-none text-dark fw-medium">Quiz</Link>
            <span 
              className="text-decoration-none text-dark fw-medium" 
              style={{ cursor: 'pointer' }} 
              onClick={handleLogout}
            >
              Logout
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;