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
  profile(@Req() req: any) {
    return req.user;
  }
  @Post('/refresh-token')
  refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }
  @Delete('/logout')
  @UseGuards(AuthGuard)
  logout() {}
}
