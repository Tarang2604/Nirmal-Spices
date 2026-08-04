import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let retries = 0;
const MAX_RETRIES = 5;

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB connected');
    retries = 0;

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected — attempting reconnect...');
      reconnect();
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });
  } catch (err) {
    logger.error({ err }, `MongoDB connection attempt ${retries + 1} failed`);
    if (++retries <= MAX_RETRIES) {
      const delay = Math.min(1000 * 2 ** retries, 30_000);
      await new Promise((r) => setTimeout(r, delay));
      return connectDB();
    }
    logger.error('Max DB reconnection attempts reached. Exiting.');
    process.exit(1);
  }
}

function reconnect(): void {
  setTimeout(() => {
    void connectDB();
  }, 5000);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
