require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { checkConnection } = require('./config/supabase');
const Logger = require('./utils/logger');

// Routes
const marketRoutes = require('./routes/market');
const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const tradeRoutes = require('./routes/trade');
const userRoutes = require('./routes/user');
const financeRoutes = require('./routes/finance');
const copyTradingRoutes = require('./routes/copyTrading');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');

const { errorHandler, notFound } = require('./utils/errorHandler');

const logger = new Logger('SERVER');
const app = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

app.set('trust proxy', 1);

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log request bodies
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    logger.debug(`Request body for ${req.path}:`, { body: req.body });
  }
  next();
});

// NO RATE LIMITING FOR DEVELOPMENT - REMOVED

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/market', marketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/copy-trading', copyTradingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  const dbConnected = await checkConnection();
  
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════
const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkConnection();
    if (!dbConnected) {
      logger.warn('Database connection failed, but starting server anyway');
    }

    app.listen(PORT, () => {
      logger.info(`⚡ TradZ API running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Database: ${dbConnected ? '✓ Connected' : '✗ Disconnected'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

startServer();
