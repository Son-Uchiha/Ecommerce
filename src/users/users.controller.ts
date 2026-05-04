import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user';
import { UpdateUserDto } from './dto/update-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  findAll() {
    return this.usersService.findAll();
  }
  @Get('/:id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('Ko tìm thấy User');
    }
    return user;
  }
  @Post('/')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
  @Put('/:id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(+id, dto);
  }
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.usersService.deleteUser(+id);
  }
}
