import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddToCartType, UpdateCartItemType } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prismaService: PrismaService) {}
  async getCart(userId: number) {
    // Tìm cart của user, include luôn các items bên trong bảng cartItem
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });
    return cart || { cartItems: [] }; // Nếu chưa có cart trả về mảng rỗng
  }

  async addToCart(userId: number, data: AddToCartType) {
    const { productId, quantity } = data;
    // 1. Kiểm tra product có tồn tại và đủ stock
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (quantity > product.stock)
      throw new BadRequestException('Sản phẩm vượt quá số lượng tồn kho');
    // 2. Tạo cart nếu user chưa có
    let cart = await this.prismaService.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prismaService.cart.create({ data: { userId } });
    }
    // 3. Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = await this.prismaService.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });

    if (existingItem) {
      // Nếu đã có -> Tăng quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock)
        throw new BadRequestException('Vượt quá số lượng tồn kho');
      return this.prismaService.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Nếu chưa có -> Thêm mới vào cart_items
      // Lấy theo giá hiện tại của product
      const priceToSave = product.salePrice ? product.salePrice : product.price;
      return this.prismaService.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: priceToSave,
        },
      });
    }
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
