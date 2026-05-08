import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});
// DTO dùng cho NestJS
export class forgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
// Type dùng trong TS
export type forgotPassword = z.infer<typeof forgotPasswordSchema>;
