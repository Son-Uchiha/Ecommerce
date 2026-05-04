import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUser } from './dto/create-user';
import { UpdateUser } from './dto/update-user';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }
  async createUser(data: CreateUser) {
    try {
      return await this.prismaService.user.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // email trùng
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
      }

      throw error;
    }
  }
  async updateUser(id: number, data: UpdateUser) {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // user không tồn tại
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }

        // email trùng
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
      }

      throw error;
    }
  }
  async deleteUser(id: number) {
    try {
      return await this.prismaService.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }
}
