import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: number;
    email: string;
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
