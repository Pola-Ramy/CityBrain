const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepo = require('../repositories/userRepository');

const signup = async (data) => {
    const exists = await userRepo.findByEmail(data.email);
    if (exists) {
        const error = new Error('Email already exists');
        error.status = 400;
        throw error;
    }
    const user = await userRepo.createUser(data);
    return user;
};

const login = async ({ email, password }) => {
    const user = await userRepo.findByEmail(email);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    return { user, token };
};

// Forget Password
const forgotPassword = async (email) => {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Email not found");

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + (10 * 60 * 1000);
    await user.save();

    return resetToken;
};

// Reset Password
const resetPassword = async (token, newPassword) => {
    const user = await userRepo.findByResetToken(token);

    if (!user || user.resetTokenExpire < Date.now()) {
        throw new Error("Invalid or expired token");
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    return true;
};

module.exports = { signup, login, forgotPassword, resetPassword };
