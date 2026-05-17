import 'dotenv/config';
import { createClient } from 'redis';

export const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
  password: process.env.REDIS_PASSWORD,
}).on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect().catch((err) => {
  console.error('Không thể kết nối tới Redis:', err);
});
