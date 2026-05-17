import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { QueryProductType } from 'src/types/request';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: QueryProductType) {
    const minPrice = query.minPrice ? Math.max(0, +query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Math.max(0, +query.maxPrice) : undefined;
    // Validate minPrice <= maxPrice
    if (minPrice && maxPrice && minPrice > maxPrice) {
      throw new BadRequestException('minPrice không thể lớn hơn maxPrice');
    }
    const { limit = 10, page = 1, keyword, categoryId } = query;
    const skip = (+page - 1) * +limit;
    const product = this.prismaService.product.findMany({
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

    // THÊM totalCount (copy y hệt where bên trên)
    const total = this.prismaService.product.count({
      where: {
        status: 'ACTIVE',
        ...(categoryId && { categoryId: +categoryId }),
        price: {
          ...(minPrice && { gte: +minPrice }),
          ...(maxPrice && { lte: +maxPrice }),
        },
        ...(keyword && {
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }),
      },
    });

    const [data, totalCount] = await Promise.all([product, total]);

    return {
      data,
      meta: {
        page: +page,
        limit: +limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / +limit),
      },
    };
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
