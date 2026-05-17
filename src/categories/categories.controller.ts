import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get('/')
  findAll() {
    return this.categoriesService.findAll();
  }
  @Get('/:CategoryId')
  findOne(@Param('CategoryId') id: number) {
    return this.categoriesService.findOne(+id);
  }
}
