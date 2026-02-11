const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

exports.signup = asyncHandler(async (req, res) => {
    const user = await authService.signup(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Signup successful',
        data: { userId: user._id }
    });
});

exports.login = asyncHandler(async (req, res) => {
    const { user, token } = await authService.login(req.body);
    res.json({
        status: 'success',
        message: 'Login successful',
        data: { token }
    });
});

exports.forgotPassword = async (req, res) => {
    try {
        const token = await authService.forgotPassword(req.body.email);
        res.json({ message: "Reset token created", token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.newPassword);
        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
