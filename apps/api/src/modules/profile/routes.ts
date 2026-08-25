import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UpdateProfileSchema } from '@stock-analyser/shared';
import { createNotFoundError, createValidationError } from '../../utils/errors.js';
import { createAuthMiddleware } from '../../middleware/auth.middleware.js';
import type { AuthService } from '../../services/auth.service.js';
import type { UserRepository } from '../../repositories/index.js';

export function registerProfileRoutes(fastify: FastifyInstance, authService: AuthService, userRepository: UserRepository) {
  const authMiddleware = createAuthMiddleware(authService, userRepository);

  fastify.get('/api/profile', { onRequest: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await userRepository.getById(request.user!.id);

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  fastify.patch('api/profile', { onRequest: [authMiddleware]}, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username } = UpdateProfileSchema.parse(request.body);

      const updated = await userRepository.update(request.user!.id, {username, updatedAt: Date.now()});

      if(!updated){
        throw createNotFoundError('User not found');
      }

      return reply.send({
        success: true,
        data: {
          id: updated.id,
          username: updated.username,
          email: updated.email,
          role: updated.role,
          createdAt: updated.createdAt,
        },
      });

    }catch(error){
      if(error instanceof Error && 'issues' in error){
        throw createValidationError('Invalid input');
      }
      throw error;
    }
  });
}
