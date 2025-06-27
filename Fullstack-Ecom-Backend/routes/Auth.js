const express = require('express');
const { createUser, loginUser, checkAuth, resetPasswordRequest, resetPassword, logout } = require('../controller/Auth');
const passport = require('passport');

const router = express.Router();
//  /auth is already added in base path
router.post('/signup', createUser)
.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log('Auth error:', err); // Debug
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Login failed' });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      next(); // Proceeds to loginUser
    });
  })(req, res, next);
}, loginUser)
.get('/check',passport.authenticate('jwt'), checkAuth)
.get('/logout', logout)
.post('/reset-password-request', resetPasswordRequest)
.post('/reset-password', resetPassword)
exports.router = router;