import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { type AuthRequest } from 'src/types/request';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@UseGuards(AuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: AuthRequest) {
    return this.cartService.getCart(+req.user.id);
  }
  @Post('items')
  addToCard(@Req() req: AuthRequest, @Body() body: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, body);
  }
  @Put('items/:productId')
  updateItemQuantity(
    @Req() req: AuthRequest,
    @Param('productId') id: number,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.id, +id, body);
  }
  @Delete('items/:productId')
  removeCartItem(@Req() req: AuthRequest, @Param('productId') id: number) {
    return this.cartService.removeCartItem(req.user.id, +id);
  }
  @Delete()
  clearCart(@Req() req: AuthRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
