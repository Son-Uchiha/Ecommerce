import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from 'src/admin/permissions/permissions.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  imports: [AuthModule, PermissionsModule],
})
export class UsersModule {}
