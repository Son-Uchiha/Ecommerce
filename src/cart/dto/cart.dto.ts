import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z
    .number()
    .int('ID sản phẩm phải là số nguyên')
    .positive('ID sản phẩm không hợp lệ'),

  quantity: z
    .number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1'),
});

export class AddToCartDto extends createZodDto(AddToCartSchema) {}

export type AddToCartType = z.infer<typeof AddToCartSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không hợp lệ'),
});

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {}

export type UpdateCartItemType = z.infer<typeof UpdateCartItemSchema>;
