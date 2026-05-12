import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { PermissionsGuardMixin } from 'src/guards/permissions/permissions.guard';

@Controller('admin/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @UseGuards(PermissionsGuardMixin('product:read'))
  @Get('')
  findAll() {
    return 'Get List Products';
  }

  @Post()
  create() {
    return 'Create Product';
  }

  @Put('/:id')
  update() {
    return 'Update Product';
  }

  @Delete('/:id')
  delete() {
    return 'Delete Product';
  }
}
