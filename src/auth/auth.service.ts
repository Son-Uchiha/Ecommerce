import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Register } from './dto/register.dto';
import { hashPassword } from 'src/ultil/hasing';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

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
