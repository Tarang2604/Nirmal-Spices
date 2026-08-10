import dns from 'dns';
// Some hosts (e.g. Render) resolve external hostnames like smtp.gmail.com to an
// IPv6 address but can't route outbound IPv6 traffic, causing ENETUNREACH.
// Prefer IPv4 results globally so outbound connections (SMTP, etc.) succeed.
dns.setDefaultResultOrder('ipv4first');

import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { closeRedis, connectRedis, isRedisEnabled } from './config/redis';
import { logger } from './utils/logger';
import { startPendingOrderExpiryJob } from './jobs/expirePendingOrders';
import http from 'http';

let server: http.Server;

async function bootstrap() {
  try {
    await connectDB();

    if (isRedisEnabled()) {
      await connectRedis();
    } else {
      logger.info('Redis disabled. Continuing without cache/session store.');
      if (env.NODE_ENV === 'production') {
        logger.warn(
          'REDIS_ENABLED is false in production. Refresh-token reuse detection and idempotency cache are weakened. Set REDIS_ENABLED=true for production.',
        );
      }
    }

    startPendingOrderExpiryJob();

    server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          await disconnectDB();
          await closeRedis();
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
      logger.info('SIGTERM received, shutting down gracefully');
      exitHandler();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      exitHandler();
    });
  } catch (err) {
    logger.fatal({ err }, 'Bootstrap failed, shutting down');
    process.exit(1);
  }
}

void bootstrap();
