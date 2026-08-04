// Setup environment variables for test execution
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nirmal-spices-test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_token_longer_than_32_characters';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_token_longer_than_32_characters';
process.env.RAZORPAY_KEY_ID = 'test_key';
process.env.RAZORPAY_KEY_SECRET = 'test_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloudinary';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.EMAIL_FROM = 'test@nirmalspices.in';

// Mock getRedis to return a mock Redis client for tests
jest.mock('../src/config/redis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    connect: jest.fn().mockResolvedValue(null),
    quit: jest.fn().mockResolvedValue(null),
  };
  return {
    getRedis: () => mockRedis,
    redisGet: jest.fn(),
    redisSet: jest.fn(),
    redisDel: jest.fn(),
    redisExists: jest.fn(),
    RedisKeys: {
      refreshToken: (userId: string, tokenId: string) => `rt:${userId}:${tokenId}`,
      allRefreshTokens: (userId: string) => `rt:${userId}:*`,
      otp: (identifier: string, type: string) => `otp:${type}:${identifier}`,
      idempotency: (key: string) => `idem:${key}`,
      guestCart: (sessionId: string) => `gcart:${sessionId}`,
      productCache: (slug: string) => `product:${slug}`,
      productsCache: (hash: string) => `products:${hash}`,
    },
  };
});

// Mock Resend mailer client
jest.mock('../src/config/mailer', () => ({
  resend: {
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test_mail_id' }),
    },
  },
  FROM: 'test@nirmalspices.in',
  REPLY_TO: 'reply@nirmalspices.in',
}));

// Mock Razorpay client
jest.mock('../src/config/razorpay', () => ({
  razorpay: {
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test_id' }),
    },
  },
  env: {
    RAZORPAY_KEY_ID: 'test_key',
    RAZORPAY_KEY_SECRET: 'test_secret',
  },
}));

// Mock Cloudinary uploader
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

// Mock Mongoose startSession to prevent transaction timeouts when no DB is connected
jest.mock('mongoose', () => {
  const original = jest.requireActual('mongoose');
  const mockStartSession = async () => ({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  });

  const mockMongooseDefault = new Proxy(original.default || original, {
    get(target, prop) {
      if (prop === 'startSession') {
        return mockStartSession;
      }
      return (target as any)[prop];
    }
  });

  const mockMongoose = new Proxy(original, {
    get(target, prop) {
      if (prop === 'startSession') {
        return mockStartSession;
      }
      if (prop === 'default') {
        return mockMongooseDefault;
      }
      return (target as any)[prop];
    }
  });

  return mockMongoose;
});


