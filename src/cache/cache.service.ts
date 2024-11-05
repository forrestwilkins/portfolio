import { createClient, RedisClientType } from 'redis';

class CacheService {
  private client: RedisClientType;

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

export default CacheService;
