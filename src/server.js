require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const sseRoutes = require('./routes/sseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const logger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/sse', sseRoutes);
app.use('/api/ai', aiRoutes);

app.use(logger);

app.get('/', (req, res) => res.send('API Running...'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
