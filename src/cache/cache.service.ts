import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

(async () => {
  redisClient = createClient();
  await redisClient.connect();

  redisClient.on('error', (error) => {
    console.error('Redis error', error);
  });
})();

class CacheService {
  async set(key: string, value: unknown) {
    await redisClient.set(key, JSON.stringify(value));
  }

  async get(key: string) {
    return redisClient.get(key);
  }

  async del(key: string) {
    await redisClient.del(key);
  }
}

export default CacheService;
