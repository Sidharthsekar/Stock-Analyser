import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'user']);

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

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
