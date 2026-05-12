import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoleType } from './dto/rbac.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}
  // 1. Lấy danh sách Roles
  getRoles() {
    return this.prismaService.role.findMany();
  }
  // 2. Tạo Role mới
  createRole(body: CreateRoleType) {
    return this.prismaService.role.create({
      data: body,
    });
  }
  // 3. Gán danh sách quyền cho một Role
  // Logic: Tìm/Tạo Permission nếu chưa có, sau đó liên kết với Role
  async assignPermissions(roleId: number, permissionNames: string[]) {
    // Bước 1: Xử lý hàng loạt Permission (Tạo những cái chưa có) sử dụng upsert
    // Lưu ý: Yêu cầu field 'name' trong bảng Permission phải là @unique
    const permissionOps = permissionNames.map((name) => {
      return this.prismaService.permission.upsert({
        where: { name },
        update: {}, // có rồi thì update rỗng
        create: { name }, // chưa có thì create
      });
    });
    const permissions = await Promise.all(permissionOps);
    // Bước 2: Gán vào bảng trung gian RolePermissions
    // Dùng createMany với skipDuplicates để tối ưu tốc độ và tránh lỗi trùng lặp
    const rolePermissionData = permissions.map((p) => ({
      roleId,
      permissionId: p.id,
    }));

    return this.prismaService.rolePermissions.createMany({
      data: rolePermissionData,
      skipDuplicates: true,
    });
  }
  // Xóa Quyền trong RoleId
  async removePermission(roleId: number, permissionName: string) {
    const permission = await this.prismaService.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const rolePermission = await this.prismaService.rolePermissions.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
    });

    if (!rolePermission) {
      throw new NotFoundException('Permission is not assigned to this role');
    }

    await this.prismaService.rolePermissions.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
    });

    return {
      message: 'Permission removed successfully',
    };
  }
  // 4. Gán danh sách User vào một Role
  async assignUsers(roleId: number, userIds: number[]) {
    const data = userIds.map((userId) => ({
      roleId,
      userId,
    }));

    return this.prismaService.userRole.createMany({
      data,
      skipDuplicates: true,
    });
  }
  // 5. Lấy toàn bộ Permission Name của một User (Tối ưu nhất)
  async getPermissionByUser(userId: number) {
    const userWithPermission = await this.prismaService.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            RolePermissions: {
              select: {
                permission: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });
    // console.log(JSON.stringify(userWithPermission, null, 2));
    const permissionNames = new Set<string>();
    userWithPermission.forEach((ur) => {
      ur.role.RolePermissions.forEach((rp) => {
        if (rp.permission?.name) {
          permissionNames.add(rp.permission.name);
        }
      });
    });
    return Array.from(permissionNames);
  }
}
