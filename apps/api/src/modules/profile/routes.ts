import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createAuthMiddleware } from '../middleware/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';
import type { UserRepository } from '../repositories/index.js';

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
}
