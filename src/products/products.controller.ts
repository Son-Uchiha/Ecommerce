import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { type QueryProductType } from 'src/types/request';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get() // GET /products?keyword=iphone&minPrice=100
  findAll(@Query() query: QueryProductType) {
    return this.productsService.findAll(query);
  }
}
