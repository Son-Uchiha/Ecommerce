import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProductStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']);

export const CreateProductSchema = z.object({
  categoryId: z
    .number()
    .int()
    .positive('Category ID phải là số nguyên dương')
    .optional()
    .nullable(),

  createdBy: z
    .number()
    .int()
    .positive('Created By phải là số nguyên dương')
    .optional()
    .nullable(),

  name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(150, 'Tên sản phẩm tối đa 150 ký tự'),

  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .max(180, 'Slug tối đa 180 ký tự'),

  description: z.string().optional().nullable(),

  price: z.number().positive('Giá phải lớn hơn 0'),

  salePrice: z
    .number()
    .positive('Giá sale phải lớn hơn 0')
    .optional()
    .nullable(),

  stock: z
    .number()
    .int('Stock phải là số nguyên')
    .min(0, 'Stock không được âm')
    .default(0),

  images: z
    .array(z.string().url('Link ảnh không hợp lệ'))
    .min(1, 'Cần ít nhất 1 hình ảnh'),

  status: ProductStatusEnum.default('ACTIVE').optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const UpdateStatusSchema = z.object({
  status: ProductStatusEnum,
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

export class UpdateStatusDto extends createZodDto(UpdateStatusSchema) {}

export type CreateProductType = z.infer<typeof CreateProductSchema>;

export type UpdateProductType = z.infer<typeof UpdateProductSchema>;

export type UpdateStatusType = z.infer<typeof UpdateStatusSchema>;
