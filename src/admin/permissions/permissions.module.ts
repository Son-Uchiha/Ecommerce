import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  imports: [AuthModule],
})
export class PermissionsModule {}
