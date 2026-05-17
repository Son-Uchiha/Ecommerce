import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthRequest } from 'src/types/request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    // 1. Kiểm tra xem có header authorization không
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }
    // 1. Lấy token từ Header Authorization
    const token = authHeader.split(' ')[1];
    // 2. Kiểm tra Token
    const data = await this.authService.profile(token);
    if (!data) {
      throw new UnauthorizedException('Token invalid');
    }
    const { jti, user, exp } = data;
    if (!user) {
      throw new UnauthorizedException('Token invalid');
    }
    request.user = user;
    request.jti = jti;
    request.exp = exp;
    return true;
  }
}
