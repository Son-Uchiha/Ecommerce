import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest } from 'src/types/request';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    if (user.isSuperAdmin) {
      return true;
    }
    return false;
  }
}
