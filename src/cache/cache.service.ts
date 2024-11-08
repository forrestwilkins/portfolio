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

  async getSubscribers(channel: string) {
    return this.client.sMembers(`channel:${channel}`);
  }

  async subscribe(channel: string, token: string) {
    return this.client.sAdd(`channel:${channel}`, token);
  }

  async unsubscribe(channel: string, token: string) {
    return this.client.sRem(`channel:${channel}`, token);
  }
}

const cacheService = new CacheService();
export default cacheService;
