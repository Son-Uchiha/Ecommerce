import 'dotenv/config';
import { createClient } from 'redis';

// Cách 1: Sử dụng ReturnType để TypeScript tự đoán chuẩn 100% type gốc
export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient;

export async function connectRedis(): Promise<RedisClient> {
  redisClient = createClient({
    socket: {
      host: '127.0.0.1',
      port: 6379,
    },
    password: process.env.REDIS_PASSWORD,
  }).on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();
  console.log('✅ Connected to Redis successfully');
  return redisClient;
}

export { redisClient };
