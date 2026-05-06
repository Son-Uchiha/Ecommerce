import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      'Refresh token không đúng định dạng JWT',
    ),
});

export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}

export type RefreshToken = z.infer<typeof refreshTokenSchema>;
