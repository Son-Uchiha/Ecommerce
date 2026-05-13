import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './admin/users/users.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { WorkerModule } from './workers/worker.module';
import { ProductsModule } from './admin/products/products.module';
import { PermissionsModule } from './admin/permissions/permissions.module';
import { AdminCategoriesModule } from './admin/categories/categories.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PermissionsModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    WorkerModule,
    AdminCategoriesModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
