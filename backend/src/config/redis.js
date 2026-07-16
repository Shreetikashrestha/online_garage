import Redis from 'ioredis';
import env from './env.js';
import logger from '../utils/logger.js';

let redis = null;

try {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redis.on('error', (err) => {
    logger.warn(`⚠️  Redis error: ${err.message}. Real-time features may be degraded.`);
  });

  redis.on('close', () => {
    logger.warn('⚠️  Redis connection closed');
  });

  redis.connect().catch((err) => {
    logger.warn(`⚠️  Redis unavailable: ${err.message}. Continuing without Redis.`);
  });
} catch (err) {
  logger.warn(`⚠️  Redis initialization failed: ${err.message}. Continuing without Redis.`);
}

export const isRedisAvailable = () => {
  return redis && redis.status === 'ready';
};

export default redis;
