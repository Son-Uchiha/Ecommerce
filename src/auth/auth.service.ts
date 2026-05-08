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
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { redisClient } from 'src/ultil/redis';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @InjectQueue('mail_queue') private emailQueue: Queue,
  ) {}

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
    if (!(await verifyPassword(password, passwordHash))) {
      throw new UnauthorizedException('Email or password invalid');
    }
    // Cấp phát token
    const payload = {
      id: user.id,
      jti: crypto.randomUUID(),
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRED as StringValue | undefined,
    });
    // Gửi mail -> add job vào hàng đợi
    await this.emailQueue.add('login-notice', {
      email: user.email,
      name: user.name,
      removeOnComplete: true, // Xóa job khỏi Redis khi xong để nhẹ RAM
    });
    return {
      user,
      accessToken,
      refreshToken,
    };
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

  async profile(token: string) {
    try {
      const { id, jti, exp } = await this.jwtService.verifyAsync(token);
      const blacklist = await redisClient.get(`blacklist:${jti}`);
      if (blacklist) {
        return false;
      }
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });
      return { user, jti, exp };
    } catch {
      return false;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      //Tạo access token mới
      const payload = {
        id,
        jti: crypto.randomUUID(),
      };
      const accessToken = await this.jwtService.signAsync(payload);
      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
  async logout(jti: string, exp: number) {
    // lưu token vào redis với expire bằng đúng thời gian sống của token
    const seconds = Math.ceil(exp - Date.now() / 1000);
    if (seconds <= 0) {
      return { message: 'token đã hết hạn' };
    }
    await redisClient.setEx(`blacklist:${jti}`, seconds, '1');
    return { message: 'logout thành công' };
  }
}
