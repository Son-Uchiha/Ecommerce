import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 1. Enum Definition
export const CategoryStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

// 2. Create Schema
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Tên danh mục không được để trống')
    .max(100, 'Tên danh mục tối đa 100 ký tự'),

  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .max(150, 'Slug tối đa 150 ký tự')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang',
    ),

  description: z.string().max(1000, 'Mô tả quá dài').optional().nullable(),

  status: CategoryStatusEnum.default('ACTIVE').optional(),
});

// 3. Update Schema (Sử dụng .partial() để các trường là không bắt buộc)
export const UpdateCategorySchema = CreateCategorySchema.partial();

// 4. Export DTO Classes
export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}

// 5. Export Types
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
