import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import validation from '../message/vadidation.json';

export const ResetPasswordSchema = z.object({
  password: z.string().min(1, validation['PASSWORD.MIN']),

  confirmPassword: z.string().min(1, validation['PASSWORD.MIN']),

  otp: z
    .string()
    .length(6, 'OTP phải gồm 6 chữ số')
    .regex(/^\d+$/, 'OTP chỉ được chứa số'),
});

// DTO cho NestJS
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

// Type cho TS
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
