import { z } from 'zod';
import { UserRole } from '../shared/index';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a valid 10-digit number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
    language: z.enum(['en', 'hi']).optional().default('en'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
