import * as dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';

dotenv.config();

class CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('error', (error) => {
      console.error('Redis error', error);
    });
  }

  async connect() {
    await this.client.connect();
  }

  async getSetMembers(key: string) {
    return this.client.sMembers(key);
  }

  async addSetMember(key: string, value: string) {
    return this.client.sAdd(key, value);
  }

  async removeSetMember(key: string, value: string) {
    return this.client.sRem(key, value);
  }

  async getStreamMessages(key: string, start = '+', end = '-') {
    return this.client.xRevRange(key, start, end);
  }

  async addStreamMessage(key: string, message: Record<string, any>) {
    return this.client.xAdd(key, '*', message, {
      TRIM: {
        strategy: 'MAXLEN',
        strategyModifier: '~',
        threshold: 10000,
      },
    });
  }

  /**
   * Expires messages in a stream older than the given time.
   * Defaults to 1 week ago.
   */
  async expireStreamMessages(
    key: string,
    time = Date.now() - 1000 * 60 * 60 * 24 * 7,
  ) {
    return this.client.xTrim(key, 'MINID', time, {
      strategyModifier: '~',
    });
  }
}

const cacheService = new CacheService();
export default cacheService;
