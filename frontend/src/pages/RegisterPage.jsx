import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../redux/authSlice';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setSuccessMsg('');

    if (isAdminRegister && !adminSecret.trim()) {
      return;
    }

    const payload = {
      username,
      password,
      isAdmin: isAdminRegister,
      adminSecret: isAdminRegister ? adminSecret.trim() : undefined
    };

    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      setSuccessMsg('Đăng ký thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="card p-4 border rounded shadow-sm" style={{ width: '100%', maxWidth: '380px' }}>
        <h3 className="text-center mb-4 fw-bold">Register</h3>

        {error && (
          <div className="alert alert-danger py-2 text-center" role="alert">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success py-2 text-center" role="alert">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="adminCheck"
              checked={isAdminRegister}
              onChange={(e) => setIsAdminRegister(e.target.checked)}
            />
            <label className="form-check-label text-secondary small fw-medium" htmlFor="adminCheck">
              Register as Admin account
            </label>
          </div>

          {isAdminRegister && (
            <div className="mb-4 p-3 bg-light border rounded">
              <label className="form-label text-dark small fw-semibold">
                Tự đặt mã bí mật Admin (Admin Secret Code) <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Tự đặt mã bí mật (VD: mySecret2026, 9999, ...)"
                required={isAdminRegister}
              />
              <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                * Bạn sẽ dùng mã này để xác thực mỗi khi đăng nhập vào tài khoản Admin. Hãy ghi nhớ mã này!
              </small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3 fw-medium"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none small text-primary">
              Already have an account? Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;