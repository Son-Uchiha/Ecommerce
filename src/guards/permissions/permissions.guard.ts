import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { PermissionsService } from 'src/admin/permissions/permissions.service';
import { AuthRequest } from 'src/types/request';

export const PermissionsGuardMixin = (
  permissionName: string,
): Type<CanActivate> => {
  @Injectable()
  class PermissionsGuard implements CanActivate {
    constructor(private readonly permissionService: PermissionsService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<AuthRequest>();
      const user = request.user;
      // 1. Kiểm tra nếu user chưa đăng nhập (AuthGuard chưa chạy hoặc lỗi)
      if (!user || !user.id) {
        return false;
      }

      // 2. Lấy danh sách quyền từ service
      const permissions = await this.permissionService.getPermissionByUser(
        user.id,
      );

      // 3. Kiểm tra quyền
      const hasPermission = permissions.includes(permissionName);

      if (!hasPermission) {
        // Bạn có thể throw exception để trả về message cụ thể cho client
        throw new ForbiddenException(`Bạn không có quyền: ${permissionName}`);
      }

      return true;
    }
  }
  return mixin(PermissionsGuard);
};
