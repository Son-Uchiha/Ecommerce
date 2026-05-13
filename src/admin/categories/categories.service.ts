import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategory, UpdateCategory } from './dto/category.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}
  async createCategory(data: CreateCategory) {
    try {
      return await this.prismaService.category.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Kiểm tra trùng Slug
        if (error.code === 'P2002') {
          throw new BadRequestException('Slug already exists');
        }
      }
      throw error;
    }
  }
  async updateCategory(id: number, data: UpdateCategory) {
    try {
      return await this.prismaService.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Category không tồn tại
        if (error.code === 'P2025') {
          throw new NotFoundException('Category not found');
        }
      }
      throw error;
    }
  }
  async deleteCategory(id: number) {
    try {
      return await this.prismaService.category.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }
}
