import { createClient, RedisClientType } from 'redis';

class CacheService {
  public client: RedisClientType;

  constructor() {
    this.client = createClient();

    this.client.on('error', (error) => {
      console.error('Redis error', error);
    });
  }

  async connect() {
    await this.client.connect();
  }
}

const cacheService = new CacheService();
export default cacheService;
