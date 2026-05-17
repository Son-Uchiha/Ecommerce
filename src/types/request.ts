import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    email: string;
    password: string;
    id: number;
    name: string;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    isSuperAdmin: boolean;
  };
  jti: string;
  exp: number;
}

export type QueryType = {
  limit?: number;
  page?: number;
  minUser?: number;
  maxUser?: number;
  keyword?: string;
};

// Định nghĩa Type cho Query Filter
export type QueryProductType = {
  keyword?: string;
  categoryId?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  page?: number;
  limit?: number;
};

export type EmailJobData = {
  email: string;
  name?: string;
  otp?: string | number;
};
