import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Bin Mishal Travels API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/v1/health',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏢 Bin Mishal Travels API Server                       ║
║                                                           ║
║   🚀 Server running on port ${config.port}                       ║
║   📦 Environment: ${config.nodeEnv}                           ║
║   🔗 API: http://localhost:${config.port}/api/v1               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
