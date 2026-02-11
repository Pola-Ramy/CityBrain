const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs folder automatically if not exists
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
    console.log('📁 logs folder created automatically');
}

const logStream = fs.createWriteStream(path.join(logDirectory, 'request.log'), { flags: 'a' });

// Simple custom logger
const simpleLogger = (req, res, next) => {
    console.log(`${req.method} - ${req.originalUrl}`);
    next();
};

// Export correct logger based on environment
if (process.env.NODE_ENV === 'development') {
    module.exports = simpleLogger;            // for development
} else {
    module.exports = morgan('combined', { stream: logStream });  // for production
}
