const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const {
  createCorsOptions,
  createApiRateLimiter,
  createAuthRateLimiter,
  securityHeaders,
} = require('./middleware/security');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const progressRoutes = require('./routes/progressRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(cors(createCorsOptions()));
app.use(express.json());
app.use(requestLogger);
app.use('/api', createApiRateLimiter());

app.get('/api', (req, res) => {
  res.json({ message: 'FitAI API starter is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', createAuthRateLimiter(), authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/nutrition', nutritionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
