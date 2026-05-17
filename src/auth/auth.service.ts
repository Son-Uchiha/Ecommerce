import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Register } from './dto/register.dto';
import { hashPassword, verifyPassword } from 'src/ultil/hashing';
import { Prisma } from 'generated/prisma/client';
import { LoginType } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { redisClient } from 'src/ultil/redis';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { forgotPassword } from './dto/forgotPassword.dto';
import * as crypto from 'crypto';
import { ResetPassword } from './dto/resetPassword.dto';
import { ChangePassword } from './dto/changePassword.dto';
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
    // Cắm jti của refresh token
    const refreshTokenPayload = await this.jwtService.decode(refreshToken);
    const ttl = Math.ceil(refreshTokenPayload.exp - Date.now() / 1000);
    // key redis: refreshToken:{userId}:{jti}
    await redisClient.setEx(
      `refreshToken:${refreshTokenPayload.id}:${refreshTokenPayload.jti}`,
      ttl,
      '1',
    );
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
      const { id, jti } = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      // Kiểm tra refresh có tồn tại trên redis hay ko
      const tokenFromRedis = await redisClient.get(`refreshToken:${id}:${jti}`);
      if (!tokenFromRedis) {
        throw new Error('Refresh token invalid');
      }
      //Tạo access token mới
      const payload = {
        id,
        jti: crypto.randomUUID(),
      };
      const accessToken = await this.jwtService.signAsync(payload);
      // Tạo refresh token mới
      const refreshTokenNew = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRED as StringValue | undefined,
      });
      //Thu hồi refresh token cũ
      await redisClient.del(`refreshToken:${id}:${jti}`);
      // Cắm jti của refresh token mới
      const refreshTokenPayload = await this.jwtService.decode(refreshTokenNew);
      const ttl = Math.ceil(refreshTokenPayload.exp - Date.now() / 1000);
      // key redis: refreshToken:{userId}:{jti}
      await redisClient.setEx(
        `refreshToken:${refreshTokenPayload.id}:${refreshTokenPayload.jti}`,
        ttl,
        '1',
      );
      return {
        accessToken,
        refreshToken: refreshTokenNew,
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

  async forgotPassword({ email }: forgotPassword) {
    // Kiểm tra email có tồn tại không ?
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }
    // Tạo mã otp 6 số
    const otp = crypto.randomInt(100000, 999999).toString();
    //Lưu vào redis kèm userId
    const ttl = 60;
    await redisClient.setEx(`forgotPassword:${otp}`, ttl, user.id.toString());
    // addJob để gửi mail otp
    await this.emailQueue.add('forgotPassword-otp', {
      otp,
      email: user.email,
    });
  }

  async verifyOtp(otp: string) {
    const userIdFromRedis = await redisClient.get(`forgotPassword:${otp}`);
    if (!userIdFromRedis) {
      throw new BadRequestException('OTP không hợp lệ');
    }
    return userIdFromRedis;
  }

  async resetPassword(data: ResetPassword) {
    const { password, confirmPassword, otp } = data;
    if (password !== confirmPassword) {
      throw new BadRequestException('2 mật khẩu không khớp nhau');
    }
    const UserId = await this.verifyOtp(otp);
    const newPassword = await hashPassword(password);
    const user = await this.prismaService.user.update({
      where: { id: +UserId },
      data: {
        password: newPassword,
      },
    });

    //add job để gửi mail resetPassword thành công
    await this.emailQueue.add('reset-password', {
      email: user.email,
    });

    //Xóa otp khỏi redis
    await redisClient.del(`forgotPassword:${otp}`);
  }
  async changePassword(userId: number, data: ChangePassword) {
    const { oldPassword, newPassword, confirmPassword } = data;
    // 1. Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu mới không khớp');
    }
    // 2. Lấy thông tin user hiện tại từ DB
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 3. Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }
    // 4. Hash mật khẩu mới và cập nhật
    const hashedNewPassword = await hashPassword(newPassword);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    // 5. (Optional) Đẩy job gửi mail thông báo đã đổi mật khẩu thành công
    await this.emailQueue.add('change-password', {
      email: user.email,
    });
    return { message: 'Đổi mật khẩu thành công' };
  }
}
