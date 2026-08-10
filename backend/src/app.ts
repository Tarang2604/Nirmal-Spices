import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';
import { env } from './config/env';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { getRedis, isRedisEnabled } from './config/redis';

const app = express();

// ── TRUST PROXY ───────────────────────────────────────────────────────
// Render/Vercel sit in front of the app behind a single reverse-proxy hop.
// Without this, req.ip resolves to the proxy's IP for every request, which
// collapses per-IP rate limiting (auth/OTP limiters) into a single shared bucket.
app.set('trust proxy', 1);

// ── SENTRY ERROR MONITORING ──────────────────────────────────────────
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

// ── REQUEST LOGGER ───────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health' || req.url === '/favicon.ico',
    },
  })
);

// ── SECURITY HEADERS ─────────────────────────────────────────────────
app.use(
  helmet({
    // Allow cross-origin browser clients (Next on :3000 → API on :5000) to read responses / set cookies
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// ── CORS ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Guest-Session-Id', 'X-Idempotency-Key'],
  })
);

// ── BODY PARSING ─────────────────────────────────────────────────────
// Save raw body buffer specifically for payment webhooks signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      if (req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── SANITIZATION & PREVENTION ────────────────────────────────────────
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(hpp());          // Prevent HTTP Parameter Pollution

// ── ROUTE LIMITING ───────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── HEALTH CHECK ─────────────────────────────────────────────────────
// Liveness — process is up, no dependency checks (fast, always cheap to hit).
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Readiness — verifies the app can actually serve requests (DB + Redis if enabled).
// Point uptime monitors / deploy health checks here, not at /health.
app.get('/health/ready', async (_req, res) => {
  const mongoUp = mongoose.connection.readyState === 1;

  let redisUp = true;
  if (isRedisEnabled()) {
    try {
      const client = getRedis();
      redisUp = (await client?.ping()) === 'PONG';
    } catch {
      redisUp = false;
    }
  }

  const ok = mongoUp && redisUp;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'unavailable',
    mongo: mongoUp ? 'up' : 'down',
    redis: isRedisEnabled() ? (redisUp ? 'up' : 'down') : 'disabled',
    timestamp: new Date(),
  });
});

// Local image uploads (used when Cloudinary credentials are not configured)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── API ROUTES MOUNT ─────────────────────────────────────────────────
app.use('/api', routes);

// ── SENTRY ERROR HANDLER (must be before custom errorHandler) ────────
if (env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ── GLOBAL ERROR HANDLING ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
