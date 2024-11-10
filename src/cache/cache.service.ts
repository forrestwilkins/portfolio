import { CronJob } from 'cron';
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

  async initializeCache() {
    await this.client.connect();
    await this.initCleanUpJob();
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

  async getStreamKeys() {
    const streams = await this.client.scan(0, { TYPE: 'stream' });
    return streams.keys;
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

  async expireStreamMessages(
    key: string,
    time = Date.now() - 1000 * 60 * 60 * 24,
  ) {
    return this.client.xTrim(key, 'MINID', time, {
      strategyModifier: '~',
    });
  }

  async cleanUpStreams() {
    const streams = await this.getStreamKeys();
    for (const stream of streams) {
      await this.expireStreamMessages(stream);
    }
  }

  async initCleanUpJob() {
    // Clean up streams every night at midnight
    const cleanUpJob = new CronJob('0 0 * * *', async () => {
      await this.cleanUpStreams();
    });
    cleanUpJob.start();
  }
}

const cacheService = new CacheService();
export default cacheService;
