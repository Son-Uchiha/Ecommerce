import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}
  findAll() {
    return this.prismaService.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }
  findOne(id: number) {
    return this.prismaService.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } }, // Đếm số sản phẩm trong danh mục
      },
    });
  }
}
