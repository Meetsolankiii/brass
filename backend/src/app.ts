import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { apiRouter } from './routes';
import { notFound, errorHandler } from './middleware/error.middleware';

const app = express();

// Trust proxy for express-rate-limit behind reverse proxies (like Render)
app.set('trust proxy', 1);

// ── Security headers ────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      const isLocalhost = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isVercel = origin && /^https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin);

      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || (isDevelopment && isLocalhost) || isVercel) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: "${origin}". Allowed origins: [${allowedOrigins.join(', ')}]`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ── Rate limiting ────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression() as express.RequestHandler);

// ── Static files (uploaded images) ───────────────────────────
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── API routes ────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
