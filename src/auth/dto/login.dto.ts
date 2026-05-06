import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import validation from '../message/vadidation.json';
const loginSchema = z.object({
  email: z
    .string()
    .min(1, validation['EMAIL.REQUIRED'])
    .prefault('')
    .pipe(z.email(validation['EMAIL.INVALID'])),
  password: z.string().min(1, validation['PASSWORD.MIN']).prefault(''),
});
export class LoginDto extends createZodDto(loginSchema) {}
export type LoginType = z.infer<typeof loginSchema>;
