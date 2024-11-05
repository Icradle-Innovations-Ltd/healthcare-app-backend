const Redis = require('ioredis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    });

    this.client.on('error', (error) => {
      logger.error('Redis Client Error', error);
    });
  }

  async set(key, value, expiration = 3600) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', expiration);
      return true;
    } catch (error) {
      logger.error('Cache Set Error', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache Get Error', error);
      return null;
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache Delete Error', error);
      return false;
    }
  }
}

module.exports = new CacheService();
