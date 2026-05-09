import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
export type ChangePassword = z.infer<typeof changePasswordSchema>;
