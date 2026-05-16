import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddToCartType, UpdateCartItemType } from './dto/cart.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}
  async getCart(userId: number) {
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                salePrice: true,
                images: {
                  where: { isMain: true },
                  select: { imageUrl: true },
                },
              },
            },
          },
        },
      },
    });
    return cart || { cartItems: [] };
  }

  async addToCart(userId: number, data: AddToCartType) {
    const { productId, quantity } = data;
    // Sử dụng Interactive Transaction
    return await this.prismaService.$transaction(
      async (tx) => {
        // 1. Kiểm tra product có tồn tại không
        const product = await tx.product.findUnique({
          where: { id: productId },
        });
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

        // 2. Lấy hoặc tạo cart một cách an toàn (Sử dụng UPSERT)
        // Upsert sẽ khóa row hoặc xử lý conflict ở cấp database, chống lỗi Duplicate Creation
        const cart = await tx.cart.upsert({
          where: { userId },
          update: {}, // Đã có thì không làm gì
          create: { userId }, // Chưa có thì tạo
        });

        // 3. Lấy item hiện tại để check số lượng trước khi thêm
        const existingItem = await tx.cartItem.findUnique({
          where: { cartId_productId: { cartId: cart.id, productId } },
        });

        const currentQuantity = existingItem?.quantity || 0;
        if (currentQuantity + quantity > product.stock) {
          throw new BadRequestException('Vượt quá số lượng tồn kho');
        }

        const priceToSave = product.salePrice ?? product.price;

        // 4. Cập nhật hoặc tạo mới CartItem (Sử dụng UPSERT + INCREMENT)
        return await tx.cartItem.upsert({
          where: {
            cartId_productId: { cartId: cart.id, productId },
          },
          update: {
            // SỬ DỤNG ATOMIC OPERATION: Database tự đảm nhận việc cộng dồn
            // Chống hoàn toàn lỗi Lost Update
            quantity: { increment: quantity },
            price: priceToSave,
          },
          create: {
            cartId: cart.id,
            productId,
            quantity,
            price: priceToSave,
          },
        });
      },
      {
        // TÙY CHỌN NÂNG CAO: Chống hoàn toàn việc Bypass Stock
        // Dùng Isolation Level là Serializable sẽ ép các transaction chạy tuần tự (hoặc rollback nếu đụng độ).
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async updateItemQuantity(
    userId: number,
    productId: number,
    data: UpdateCartItemType,
  ) {
    const { quantity } = data;
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
    });
    if (!cart) throw new NotFoundException('Giỏ hàng trống');
    // Kiểm tra CartItem có tồn tại không
    const cartItem = await this.prismaService.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (!cartItem)
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    // Nếu số lượng <= 0 thì xóa item khỏi cart
    if (quantity <= 0) {
      return this.prismaService.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });
    }
    // KIỂM TRA TỒN KHO
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: { stock: true }, // Chỉ lấy cột stock để tối ưu hiệu suất
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Sản phẩm chỉ còn ${product.stock} chiếc trong kho`,
      );
    }
    // Cập nhật số lượng
    return this.prismaService.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
  }

  async removeCartItem(userId: number, productId: number) {
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
    });
    if (!cart) throw new NotFoundException('Giỏ hàng trống');
    return this.prismaService.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
  }
  async clearCart(userId: number) {
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
    });
    if (!cart) return;

    // Xóa toàn bộ item trong giỏ (nhờ Cascade hoặc xóa trực tiếp)
    return this.prismaService.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
