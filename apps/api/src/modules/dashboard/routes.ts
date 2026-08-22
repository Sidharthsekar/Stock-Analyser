import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createAuthMiddleware } from '../middleware/auth.middleware.js';
import type { AuthService } from '../services/auth.service.js';
import type { UserRepository } from '../repositories/index.js';

export function registerDashboardRoutes(fastify: FastifyInstance, authService: AuthService, userRepository: UserRepository) {
  const authMiddleware = createAuthMiddleware(authService, userRepository);

  fastify.get('/api/dashboard', { onRequest: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        welcome: `Welcome, ${request.user?.username}`,
        message: 'Stock research features will be available here.',
      },
    });
  });
}
