import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { type QueryProductType } from 'src/types/request';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  //GET products?keyword=iphone&categoryId=1&minPrice=100&maxPrice=1000&page=1&limit=10
  @Get()
  findAll(@Query() query: QueryProductType) {
    return this.productsService.findAll(query);
  }
  @Get(':id') // GET /products/1
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(+id);
  }
}
