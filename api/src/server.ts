import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { getRedis } from './config/redis';
import { logger } from './utils/logger';
import http from 'http';

let server: http.Server;

async function bootstrap() {
  try {
    // 1. Database Connection
    await connectDB();

    // 2. Cache / Redis Connection
    const redis = getRedis();
    await redis.connect().catch((err) => {
      // Redis is optional but highly recommended; log but do not crash immediately
      logger.error({ err }, 'Failed to eagerly connect to Redis — will retry lazily');
    });

    // 3. Start Server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // 4. Graceful Shutdown handlers
    const exitHandler = () => {
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          await disconnectDB();
          
          try {
            await getRedis().quit();
            logger.info('Redis connection closed');
          } catch {}

          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      logger.fatal({ err: error }, 'Unexpected system error encountered');
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received — shutting down gracefully');
      exitHandler();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received — shutting down gracefully');
      exitHandler();
    });

  } catch (err) {
    logger.fatal({ err }, 'Bootstrap failed — shutting down');
    process.exit(1);
  }
}

void bootstrap();
