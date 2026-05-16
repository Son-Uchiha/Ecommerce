import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { PermissionsGuardMixin } from 'src/guards/permissions/permissions.guard';
import { type QueryProductType } from 'src/types/request';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStatusDto,
} from './dto/product.dto';

@UseGuards(AuthGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  //GET products?keyword=iphone&categoryId=1&minPrice=100&maxPrice=1000&page=1&limit=10
  @UseGuards(PermissionsGuardMixin('product:read'))
  @Get()
  findAll(@Query() query: QueryProductType) {
    return this.productsService.findAll(query);
  }
  @UseGuards(PermissionsGuardMixin('product:read'))
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(+id);
  }
  @UseGuards(PermissionsGuardMixin('product:create'))
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }
  @UseGuards(PermissionsGuardMixin('product:update'))
  @Put('/:id')
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(+id, updateProductDto);
  }
  @UseGuards(PermissionsGuardMixin('product:delete'))
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.productsService.deleteProduct(+id);
  }
  @UseGuards(PermissionsGuardMixin('product:update'))
  @Put('/:id/status')
  updateStatus(@Param('id') id: number, @Body() updateStatus: UpdateStatusDto) {
    return this.productsService.updateStatus(+id, updateStatus);
  }
}
