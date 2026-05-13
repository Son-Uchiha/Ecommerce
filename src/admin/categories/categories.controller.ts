import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { PermissionsGuardMixin } from 'src/guards/permissions/permissions.guard';

@UseGuards(AuthGuard)
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @UseGuards(PermissionsGuardMixin('category:create'))
  @Post('/')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }
  @Put('/:id')
  update(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(+id, dto);
  }
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.categoriesService.deleteCategory(+id);
  }
}
