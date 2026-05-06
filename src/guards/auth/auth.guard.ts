import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Lấy token từ Header Authorization
    const token = request.headers.authorization.split(' ')[1];
    // 2. Kiểm tra Token
    const user = await this.authService.profile(token);
    if (!user) {
      throw new UnauthorizedException('Token invalid');
    }
    request.user = user;
    return true;
  }
}
