require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const logger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');
const { initWsServer } = require('./sockets/wsServer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Logger Middleware
app.use(logger);

// Health Check
app.get('/', (req, res) => res.send('API Running...'));

// Error Handler (Always Last)
app.use(errorHandler);

// Create HTTP server and attach WebSocket server
const server = http.createServer(app);
initWsServer(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
