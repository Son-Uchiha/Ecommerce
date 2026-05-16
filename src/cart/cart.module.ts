import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from 'src/admin/permissions/permissions.module';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService],
  imports: [AuthModule, PermissionsModule],
})
export class CartModule {}
