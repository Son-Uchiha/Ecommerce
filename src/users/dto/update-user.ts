import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import validation from '../message/vadidation.json';

const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, validation['NAME.REQUIRED'])
    .max(100, validation['NAME.MAX'])
    .optional(),

  email: z
    .string()
    .min(1, validation['EMAIL.REQUIRED'])
    .max(150, validation['EMAIL.MAX'])
    .pipe(z.email(validation['EMAIL.INVALID']))
    .optional(),

  password: z
    .string()
    .min(6, validation['PASSWORD.MIN'])
    .max(255, validation['PASSWORD.MAX'])
    .optional(),

  phone: z.string().max(20, validation['PHONE.MAX']).optional(),

  status: z.enum(['ACTIVE', 'BLOCKED']).optional(),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {}

export type UpdateUser = z.infer<typeof updateUserSchema>;
