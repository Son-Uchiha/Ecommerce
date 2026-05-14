import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user';
import { UpdateUserDto } from './dto/update-user';
import { PermissionsGuardMixin } from 'src/guards/permissions/permissions.guard';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { type QueryType } from 'src/types/request';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(PermissionsGuardMixin('user:read'))
  @Get('/')
  findAll(@Query() query: QueryType) {
    return this.usersService.findAll(query);
  }
  @UseGuards(PermissionsGuardMixin('user:read'))
  @Get('/:id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('Ko tìm thấy User');
    }
    return user;
  }
  @UseGuards(PermissionsGuardMixin('user:create'))
  @Post('/')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
  @UseGuards(PermissionsGuardMixin('user:update'))
  @Put('/:id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(+id, dto);
  }
  @UseGuards(PermissionsGuardMixin('user:delete'))
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.usersService.deleteUser(+id);
  }
}
