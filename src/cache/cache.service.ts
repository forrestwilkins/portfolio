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

  getUserKey(token: string) {
    return `user:${token}`;
  }

  getChannelKey(channel: string) {
    return `channel:${channel}`;
  }

  async getUser(token: string) {
    const userKey = this.getUserKey(token);
    const user = await this.client.get(userKey);
    if (!user) {
      return null;
    }
    return JSON.parse(user);
  }

  async setUser(token: string) {
    const userKey = this.getUserKey(token);
    return this.client.set(userKey, JSON.stringify({ createdAt: new Date() }));
  }

  async getSubscribers(channel: string) {
    const channelKey = this.getChannelKey(channel);
    return this.client.sMembers(channelKey);
  }

  async subscribe(channel: string, token: string) {
    const channelKey = this.getChannelKey(channel);
    return this.client.sAdd(channelKey, token);
  }

  async unsubscribe(channel: string, token: string) {
    const channelKey = this.getChannelKey(channel);
    return this.client.sRem(channelKey, token);
  }
}

const cacheService = new CacheService();
export default cacheService;
