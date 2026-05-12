import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// 1. Schema & DTO cho việc tạo Role mới
export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Tên Role không được để trống'),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}

// 2. Schema & DTO cho việc gán Permission vào Role
export const AssignPermissionsSchema = z.object({
  permissions: z
    .array(z.string().min(1, 'Tên quyền không được để trống'))
    .nonempty('Danh sách permission không được để trống'),
});

export class AssignPermissionsDto extends createZodDto(
  AssignPermissionsSchema,
) {}

// 3. Schema & DTO cho việc gán Users vào Role
export const AssignUsersSchema = z.object({
  userIds: z
    .array(z.number().int('UserId phải là số nguyên'))
    .nonempty('Danh sách userIds không được để trống'),
});

export class AssignUsersDto extends createZodDto(AssignUsersSchema) {}

// (Tùy chọn) Export type để sử dụng cho Service nếu cần
export type CreateRoleType = z.infer<typeof CreateRoleSchema>;
export type AssignPermissionsType = z.infer<typeof AssignPermissionsSchema>;
export type AssignUsersType = z.infer<typeof AssignUsersSchema>;
