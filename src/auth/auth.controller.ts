import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import type { AuthRequest } from 'src/types/request';
import { forgotPasswordDto } from './dto/forgotPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  login(@Body() dataLogin: LoginDto) {
    return this.authService.login(dataLogin);
  }
  @Post('/register')
  register(@Body() dataRegister: RegisterDto) {
    return this.authService.register(dataRegister);
  }
  @Get('/profile')
  @UseGuards(AuthGuard)
  profile(@Req() req: AuthRequest) {
    return req.user;
  }
  @Post('/refresh-token')
  refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }
  @Delete('/logout')
  @UseGuards(AuthGuard)
  logout(@Req() req: AuthRequest) {
    // lấy đc jti id token để xử lý service thêm vào redis
    const jti = req.jti;
    const exp = req.exp;
    return this.authService.logout(jti, exp);
  }
  @Post('/forgot-password')
  async forgotPassword(@Body() dto: forgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return {
      success: true,
      message: 'Kiểm tra mail',
    };
  }
}
