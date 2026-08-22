import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserSchema, USER_ROLES } from '@stock-analyser/shared';
import {
  createValidationError,
  createConflictError,
  createCannotDeleteAdminError,
  createNotFoundError,
  createAuthenticationError,
} from '../../utils/errors.js';
import { createAuthMiddleware, createAuthorizationMiddleware } from '../../middleware/auth.middleware.js';
import type { AuthService } from '../../services/auth.service.js';
import type { UserRepository } from '../../repositories/index.js';

export function registerUsersRoutes(fastify: FastifyInstance, authService: AuthService, userRepository: UserRepository) {
  const authMiddleware = createAuthMiddleware(authService, userRepository);
  const adminOnly = createAuthorizationMiddleware(USER_ROLES.ADMIN);

  // List users (admin only)
  fastify.get('/api/users', { onRequest: [authMiddleware, adminOnly] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const users = await userRepository.getAll();
    const publicUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return reply.send({
      success: true,
      data: {
        users: publicUsers,
      },
    });
  });

  // Create user (admin only)
  fastify.post('/api/users', { onRequest: [authMiddleware, adminOnly] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, email, password } = CreateUserSchema.parse(request.body);

      // Check if user already exists
      const existingByEmail = await userRepository.findByEmail(email);
      if (existingByEmail) {
        throw createConflictError(`User with email ${email} already exists`);
      }

      const passwordHash = await authService.hashPassword(password);

      const user = await userRepository.create({
        username,
        email,
        passwordHash,
        role: USER_ROLES.USER,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return reply.status(201).send({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        throw createValidationError('Invalid user data');
      }
      throw error;
    }
  });

  // Delete user (admin only)
  fastify.delete('/api/users/:id', { onRequest: [authMiddleware, adminOnly] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.params as { id: string }).id;

    if (!request.user) {
      throw createAuthenticationError();
    }

    const userToDelete = await userRepository.getById(userId);
    if (!userToDelete) {
      throw createNotFoundError('User not found');
    }

    if (userToDelete.role === USER_ROLES.ADMIN) {
      throw createCannotDeleteAdminError();
    }

    const deleted = await userRepository.delete(userId);
    if (!deleted) {
      throw createNotFoundError('User not found');
    }

    return reply.send({
      success: true,
      data: null,
    });
  });
}
