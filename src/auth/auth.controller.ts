import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
}
