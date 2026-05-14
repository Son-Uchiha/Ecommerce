import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { QueryProductType } from 'src/types/request';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: QueryProductType) {
    const {
      limit = 10,
      page = 1,
      minPrice,
      maxPrice,
      keyword,
      categoryId,
    } = query;
    const skip = (+page - 1) * +limit;
    return this.prismaService.product.findMany({
      skip: skip,
      take: +limit,
      where: {
        // Chỉ lấy sản phẩm đang ACTIVE (Tùy chọn)
        status: 'ACTIVE',

        ...(categoryId && {
          categoryId: +categoryId,
        }),

        // Filter theo giá (price)
        price: {
          ...(minPrice && {
            gte: +minPrice, // Lớn hơn hoặc bằng
          }),
          ...(maxPrice && {
            lte: +maxPrice, // Nhỏ hơn hoặc bằng
          }),
        },

        // Search keyword (áp dụng cho name và description)
        ...(keyword && {
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }),
      },

      // Include category và images
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
            isMain: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
