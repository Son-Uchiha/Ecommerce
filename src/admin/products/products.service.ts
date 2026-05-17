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
  UpdateStatusType,
} from './dto/product.dto';
import { Prisma } from 'generated/prisma/client';

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

    const product = await this.prismaService.product.findMany({
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
    // THÊM totalCount (copy y hệt where bên trên)
    const total = this.prismaService.product.count({
      where: {
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

  async updateProduct(id: number, data: UpdateProductType) {
    const { images, ...productData } = data;
    // loại bỏ ảnh trùng
    // undefined: user không update images, [] : user muốn xoá hết images
    const uniqueImages = images ? [...new Set(images)] : undefined;
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // Kiểm tra product tồn tại
        const product = await tx.product.findUnique({
          where: { id },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        // update thông tin product
        await tx.product.update({
          where: { id },
          data: productData,
        });

        // if có gửi images thì update lại toàn bộ ảnh
        if (uniqueImages !== undefined) {
          // xóa ảnh cũ
          await tx.productImage.deleteMany({
            where: { productId: id },
          });

          // Tạo ảnh mới
          if (uniqueImages.length > 0) {
            await tx.productImage.createMany({
              data: uniqueImages.map((url, index) => ({
                imageUrl: url,
                isMain: index === 0,
                productId: id,
              })),
              skipDuplicates: true,
            });
          }
        }

        // Trả về product mới
        return await tx.product.findUnique({
          where: { id },
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

  async deleteProduct(id: number) {
    try {
      return await this.prismaService.product.delete({
        where: { id },
        select: { id: true, name: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }

  async updateStatus(id: number, data: UpdateStatusType) {
    try {
      return await this.prismaService.product.update({
        where: { id },
        data,
        select: { id: true, status: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }
}
