const User = require('../models/User');

const findByEmail = (email) => User.findOne({ email });
// const createUser = (data) => User.create(data);

const createUser = async (data) => {
    const user = new User(data);
    await user.save();
    return user;
};

// For reset password
const findByResetToken = (token) => User.findOne({ resetToken: token });


module.exports = { findByEmail, createUser, findByResetToken };
