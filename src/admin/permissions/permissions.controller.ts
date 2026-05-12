import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { SuperAdminGuard } from 'src/guards/super-admin/super-admin.guard';
import {
  AssignPermissionsDto,
  AssignUsersDto,
  CreateRoleDto,
} from './dto/rbac.dto';

@Controller('admin')
@UseGuards(AuthGuard, SuperAdminGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Get('/roles')
  getRoles() {
    return this.permissionsService.getRoles();
  }

  @Post('/roles')
  createRole(@Body() body: CreateRoleDto) {
    return this.permissionsService.createRole(body);
  }
  // Gán quyền vào Role
  @Put('roles/:roleId/permissions')
  assignPermissions(
    @Param('roleId') id: number,
    @Body() { permissions }: AssignPermissionsDto,
  ) {
    return this.permissionsService.assignPermissions(+id, permissions);
  }
  // Xóa quyền khỏi RoleId
  @Delete(':roleId/permissions/:permissionName')
  removePermission(
    @Param('roleId') roleId: number,
    @Param('permissionName') permissionName: string,
  ) {
    return this.permissionsService.removePermission(roleId, permissionName);
  }
  // Gán user vào Role
  @Put('roles/:roleId/users')
  assignUsers(
    @Param('roleId') id: number,
    @Body() { userIds }: AssignUsersDto,
  ) {
    return this.permissionsService.assignUsers(+id, userIds);
  }
}
