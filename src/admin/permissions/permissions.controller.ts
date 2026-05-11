import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { SuperAdminGuard } from 'src/guards/super-admin/super-admin.guard';

@Controller('permissions')
@UseGuards(AuthGuard, SuperAdminGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Get('')
  findAll() {
    return 'Get List ';
  }

  @Post()
  create() {
    return 'Create';
  }

  @Put('/:id')
  update() {
    return 'Update';
  }

  @Delete('/:id')
  delete() {
    return 'Delete';
  }
}
