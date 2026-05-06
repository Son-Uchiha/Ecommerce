import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Register } from './dto/register.dto';
import { hashPassword, verifyPassword } from 'src/ultil/hasing';
import { Prisma } from 'generated/prisma/client';
import { LoginType } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async login(dataLogin: LoginType) {
    // Kiểm tra email có tồn tại hay ko
    const { email, password } = dataLogin;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Email or Password invalid');
    }
    // Verify Password
    const passwordHash = user.password;
    if (!verifyPassword(password, passwordHash)) {
      throw new UnauthorizedException('Email or password invalid');
    }
  }
  async register(dataRegister: Register) {
    const { email, password } = dataRegister;
    // check email trùng sớm
    const emailCheck = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (emailCheck) {
      throw new ConflictException('Email đã tồn tại');
    }
    // check từ database
    try {
      return this.prismaService.user.create({
        data: {
          ...dataRegister,
          password: await hashPassword(password),
        },
      });
    } catch (error) {
      // Chặn chắc ở DB (race condition)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email đã tồn tại');
      }
      throw error;
    }
  }
}
