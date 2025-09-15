import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import { extractClientIP, isPrivateOrLocalIP } from './utils/ipUtils';
import HealthRoutes from './routes/health';
import BotRoutes from './routes/bot';
import ChatRoutes from './routes/chat';
import { CertificationRoutes } from './routes/certifications';

const app = express();

// Configure Express to trust proxy headers
// This is essential for proper IP detection behind proxies, load balancers, Docker, etc.
app.set('trust proxy', 1); // Trust first proxy

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging with enhanced IP detection
app.use((req, res, next) => {
  const ipInfo = extractClientIP(req);
  const isPrivateIP = isPrivateOrLocalIP(ipInfo.ip);

  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: ipInfo.ip,
    ipSource: ipInfo.source,
    isPrivateIP,
    userAgent: req.get('User-Agent'),
    // Include proxy headers for debugging in development
    ...(process.env.NODE_ENV !== 'production' && {
      rawIP: ipInfo.rawIP,
      proxyHeaders: ipInfo.headers,
    }),
  });

  // Add the detected IP info to the request object for use in other middleware/routes
  (req as any).clientIP = ipInfo;

  next();
});

// Routes
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    message: 'Welcome to Aryabytes API',
    status: 'success',
    version: '1.0.0',
    iss: 'Aryabytes',
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.use('/aryabytes/api/services/health', HealthRoutes);
app.use('/aryabytes/api/services', BotRoutes);
app.use('/aryabytes/api/services', ChatRoutes);
app.use('/aryabytes/api/services', CertificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
