const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

/* GET users listing - Chi danh cho Admin (Task 3) */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

/* POST /users/signup - Dang ky tai khoan moi */
router.post('/signup', async (req, res, next) => {
  try {
    const { username, password, admin, isAdmin, adminSecret } = req.body;

    let checkAdmin = false;
    let savedSecret = '';

    const requestedAdmin = admin === true || admin === 'true' || admin === 1 || admin === '1' ||
                           isAdmin === true || isAdmin === 'true' || isAdmin === 1 || isAdmin === '1';

    if (requestedAdmin) {
      if (!adminSecret || !adminSecret.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng tự đặt Mã bảo mật Admin (Admin Secret Code) để đăng ký tài khoản Quản trị viên!'
        });
      }
      checkAdmin = true;
      savedSecret = adminSecret.trim();
    } else if (adminSecret && adminSecret.trim().length > 0) {
      checkAdmin = true;
      savedSecret = adminSecret.trim();
    }

    const user = new User({
      username: username,
      admin: checkAdmin,
      adminSecret: savedSecret
    });

    const registeredUser = await User.register(user, password);
    res.status(200).json({
      success: true,
      status: 'Registration Successful!',
      user: {
        _id: registeredUser._id,
        username: registeredUser.username,
        admin: registeredUser.admin,
        isAdmin: registeredUser.admin
      }
    });
  } catch (err) {
    res.status(500).json({ err: err.message || err });
  }
});

/* POST /users/login - Dang nhap tra ve JSON 100% ke ca khi sai mat khau */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: info && info.message ? info.message : 'Invalid username or password',
        error: 'Unauthorized'
      });
    }
    const token = authenticate.getToken({ _id: user._id });
    res.status(200).json({ success: true, token: token, user: { _id: user._id, username: user.username, admin: user.admin }, status: 'You are successfully logged in!' });
  })(req, res, next);
});

/* POST /users/verify-admin-secret - Xac thuc ma secret rieng cua tung Admin */
router.post('/verify-admin-secret', async (req, res) => {
  try {
    const { userId, username, adminSecret } = req.body;
    const query = [];
    if (userId) query.push({ _id: userId });
    if (username) query.push({ username: username });

    const user = await User.findOne(query.length > 0 ? { $or: query } : { username: '' });
    if (!user || !user.admin) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản Quản trị viên!' });
    }

    if (!adminSecret || !adminSecret.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã bảo mật Admin!' });
    }

    // So sanh ma bi mat do nguoi dung tu thiet lap
    const inputSecret = adminSecret.trim();
    if (user.adminSecret && user.adminSecret === inputSecret) {
      return res.status(200).json({ success: true, message: 'Xác thực Admin thành công!' });
    } else if (!user.adminSecret && (inputSecret === 'quynhanh' || inputSecret === '123456')) {
      // Fallback cho tài khoản mẫu cũ nếu chưa có secret riêng
      return res.status(200).json({ success: true, message: 'Xác thực Admin thành công!' });
    } else {
      return res.status(403).json({ success: false, message: 'Mã xác nhận Admin không chính xác!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /users/logout */
router.get('/logout', (req, res, next) => {
  res.status(200).json({ status: 'Logout successful' });
});

module.exports = router;
