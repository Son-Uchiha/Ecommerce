import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PrismaService],
  imports: [AuthModule],
  exports: [PermissionsService],
})
export class PermissionsModule {}
