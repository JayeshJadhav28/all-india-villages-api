import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import geoRoutes from './routes/geo.routes.js';
import authRoutes from './routes/auth.routes.js';
import b2bRoutes from './routes/b2b.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { requestId, apiLogger } from './middlewares/logger.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());

// Request tracking
app.use(requestId);
app.use(apiLogger);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'AllIndia Villages API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/v1', geoRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
    meta: {
      requestId: req.requestId,
    },
  });
});

// Error handler
app.use(errorHandler);

export default app;