import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
  imports: [AuthModule, PermissionsModule],
})
export class AdminCategoriesModule {}
