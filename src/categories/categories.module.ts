import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from 'src/admin/permissions/permissions.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
})
export class CategoriesModule {}
