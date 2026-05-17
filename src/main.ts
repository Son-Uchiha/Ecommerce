import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectRedis } from './ultil/redis';

async function bootstrap() {
  await connectRedis();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
// Bổ sung .catch() ở đây
bootstrap().catch((err) => {
  console.error('Lỗi khi khởi động ứng dụng NestJS:', err);
  process.exit(1);
});
