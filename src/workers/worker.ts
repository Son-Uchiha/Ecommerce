import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { connectRedis } from 'src/ultil/redis';

async function bootstrap() {
  await connectRedis();
  await NestFactory.createApplicationContext(WorkerModule);
}

// Bổ sung .catch() ở đây để xử lý lỗi
bootstrap().catch((err) => {
  console.error('Lỗi khi khởi động Worker:', err);
  process.exit(1); // Dừng process nếu worker không thể khởi động
});
