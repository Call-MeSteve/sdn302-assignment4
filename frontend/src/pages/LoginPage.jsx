import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, verifyAdminSecret, cancelAdminVerification, clearError } from '../redux/authSlice';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminSecretInput, setAdminSecretInput] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, isAdmin, requiresAdminVerification, tempAuth } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, navigate, dispatch]);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    dispatch(clearError());
    await dispatch(loginUser({ username, password }));
  };

  const handleVerifyAdmin = async (e) => {
    e.preventDefault();
    if (!adminSecretInput.trim()) return;
    dispatch(clearError());
    await dispatch(verifyAdminSecret({ adminSecret: adminSecretInput.trim(), tempAuth }));
  };

  const handleCancelAdmin = () => {
    dispatch(cancelAdminVerification());
    setAdminSecretInput('');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="card p-4 border rounded shadow-sm" style={{ width: '100%', maxWidth: '390px' }}>
        {error && (
          <div className="alert alert-danger py-2 text-center small mb-3" role="alert">
            {error}
          </div>
        )}

        {/* BƯỚC 2: XÁC THỰC ADMIN SECRET NẾU LÀ ADMIN */}
        {requiresAdminVerification ? (
          <div>
            <div className="text-center mb-3">
              <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">
                🛡️ Bước 2: Bảo mật Quản trị viên
              </span>
            </div>
            <h4 className="text-center mb-2 fw-bold">Admin Verification</h4>
            <p className="text-secondary small text-center mb-3">
              Tài khoản <strong>{tempAuth?.user?.username}</strong> có quyền Quản trị viên. Vui lòng nhập <strong>Mã bí mật Admin</strong> bạn đã tự đặt khi đăng ký để tiếp tục.
            </p>

            <form onSubmit={handleVerifyAdmin}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Admin Secret Code</label>
                <input
                  type="password"
                  className="form-control"
                  value={adminSecretInput}
                  onChange={(e) => setAdminSecretInput(e.target.value)}
                  placeholder="Nhập mã bí mật Admin của bạn"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning text-dark fw-bold w-100 py-2 mb-2"
                disabled={loading}
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận & Vào Admin'}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 py-2"
                onClick={handleCancelAdmin}
                disabled={loading}
              >
                Quay lại
              </button>
            </form>
          </div>
        ) : (
          /* BƯỚC 1: ĐĂNG NHẬP THƯỜNG */
          <div>
            <h3 className="text-center mb-4 fw-bold">Login</h3>

            <form onSubmit={handleSubmitLogin}>
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

              <div className="mb-4">
                <label className="form-label text-secondary small">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ borderLeft: 'none' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3 fw-medium"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center">
                <Link to="/register" className="text-decoration-none small text-primary">
                  Don't have an account? Register here
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;