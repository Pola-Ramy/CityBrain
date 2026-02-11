const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },

    // New fields for reset password
    resetToken: String,
    resetTokenExpire: Date
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Hide password
userSchema.set('toJSON', {
    transform: (doc, ret) => { delete ret.password; return ret; }
});

module.exports = mongoose.model('User', userSchema);
