import { createClient, RedisClientType } from 'redis';

class CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
  }

  async connect() {
    await this.client.connect();

    this.client.on('error', (error) => {
      console.error('Redis error', error);
    });
  }
}

export default CacheService;
