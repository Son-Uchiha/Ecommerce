import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { QueryProductType } from 'src/types/request';
import {
  CreateProductDto,
  CreateProductType,
  UpdateProductType,
} from './dto/product.dto';
import { Prisma } from 'generated/prisma/client';

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

  async createProduct(data: CreateProductType) {
    const { images, ...productData } = data;
    const uniqueImages = [...new Set(images)];
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: productData,
        });
        //Tạo images với id product
        await tx.productImage.createMany({
          data: uniqueImages.map((url, index) => ({
            imageUrl: url,
            isMain: index === 0,
            productId: product.id,
          })),
          skipDuplicates: true,
        });
        // Trả về product + images
        return await tx.product.findUnique({
          where: { id: product.id },
          include: {
            category: { select: { id: true, name: true } },
            images: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Slug already exists');
      }
      throw error;
    }
  }

  async updateProduct(id: number, data: UpdateProductType) {}
}
