import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUser } from './dto/create-user';
import { UpdateUser } from './dto/update-user';
import { Prisma } from 'generated/prisma/client';
import { hashPassword } from 'src/ultil/hasing';
import { QueryType } from 'src/types/request';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: QueryType) {
    console.log(query);
    const { limit = 5, page = 1, minUser, maxUser, keyword } = query;
    const skip = (page - 1) * limit;
    return this.prismaService.user.findMany({
      skip: +skip,
      take: +limit,
      where: {
        // filter id
        id: {
          ...(minUser && {
            gte: +minUser, // greater than or equal
          }),

          ...(maxUser && {
            lte: +maxUser, // less than or equal
          }),
        },

        // search Keyword
        name: {
          contains: keyword,
        },
      },
      include: {
        userRoles: {
          select: {
            roleId: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }
  async createUser(data: CreateUser) {
    const { password } = data;
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await hashPassword(password),
        },
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
    const { password } = data;
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: {
          ...data,
          password: await hashPassword(password as string),
        },
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
