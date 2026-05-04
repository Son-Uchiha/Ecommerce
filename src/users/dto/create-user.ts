import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import validation from '../message/vadidation.json';

const createUserSchema = z.object({
  name: z
    .string()
    .min(1, validation['NAME.REQUIRED'])
    .max(100, validation['NAME.MAX'])
    .prefault(''),

  email: z
    .string()
    .min(1, validation['EMAIL.REQUIRED'])
    .max(150, validation['EMAIL.MAX'])
    .prefault('')
    .pipe(z.email(validation['EMAIL.INVALID'])),

  password: z
    .string()
    .min(6, validation['PASSWORD.MIN'])
    .max(255, validation['PASSWORD.MAX'])
    .prefault(''),

  phone: z.string().max(20, validation['PHONE.MAX']).optional(),

  status: z.enum(['ACTIVE', 'BLOCKED']).optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
export type CreateUser = z.infer<typeof createUserSchema>;
