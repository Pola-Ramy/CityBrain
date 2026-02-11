const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validation/auth.validation');
const protect = require('../middleware/protect');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Forget Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.post('/reset-password/:token', resetPassword);

// Protected Example
router.get('/dashboard', protect, (req, res) => {
    res.json({ message: "Welcome Engineer", user: req.user });
});

module.exports = router;
