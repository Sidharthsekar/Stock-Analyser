import { z } from 'zod';
import { USER_ROLES } from './constants.js';

export const UserRoleSchema = z.enum([USER_ROLES.ADMIN, USER_ROLES.USER]);

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateUserSchema = z.object({
  username: z.string().min(1, 'Username is required').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UserIdSchema = z.string().uuid('Invalid user ID');

export const DeleteUserSchema = z.object({
  userId: UserIdSchema,
});

export const UpdateProfileSchema = z.object({
  username: z.string().min(1, 'Name is required').max(255),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
