require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createAiUser = async () => {
    try {
        await connectDB();

        const email = process.env.AI_USER_EMAIL || 'ai@company.local';
        const password = process.env.AI_USER_PASSWORD;

        if (!password) {
            console.error('❌ Error: AI_USER_PASSWORD is not set in .env');
            process.exit(1);
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(`ℹ️ AI user already exists: ${email}`);
            // Update password and role just in case
            existingUser.password = password;
            existingUser.role = 'AI';
            await existingUser.save();
            console.log('✅ AI user updated with current credentials and role');
        } else {
            await User.create({
                firstName: 'AI',
                lastName: 'Server',
                email,
                password,
                role: 'AI'
            });
            console.log(`✅ AI user created successfully: ${email}`);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error creating AI user:', err.message);
        process.exit(1);
    }
};

createAiUser();
