import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LoginSchema } from '@stock-analyser/shared';
import { createInvalidCredentialsError, createValidationError } from '../../utils/errors.js';
import { createAuthMiddleware } from '../../middleware/auth.middleware.js';
import { config } from '../../config/index.js';
import type { AuthService } from '../../services/auth.service.js';
import type { UserRepository } from '../../repositories/index.js';

export function registerAuthRoutes(fastify: FastifyInstance, authService: AuthService, userRepository: UserRepository) {
  const authMiddleware = createAuthMiddleware(authService, userRepository);

  // Login
  fastify.post('/api/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw createInvalidCredentialsError();
      }

      const passwordValid = await authService.verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        throw createInvalidCredentialsError();
      }

      const session = await authService.createSession(user.id, config.sessionTimezone);

      reply.setCookie(config.sessionCookieName, session.id, {
        httpOnly: true,
        secure: config.sessionCookieSecure,
        sameSite: config.sessionCookieSameSite,
        path: '/',
        maxAge: session.expiresAt - session.createdAt,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        throw createValidationError('Invalid email or password format');
      }
      throw error;
    }
  });

  // Logout
  fastify.post('/api/auth/logout', { onRequest: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if(request.sessionId){
      await authService.invalidateSession(request.sessionId);
    }
    reply.clearCookie(config.sessionCookieName, { path: '/'});
    return reply.send({
      success: true,
      data: null,
    });
  });

  // Get current authenticated user
  fastify.get('/api/auth/me', { onRequest: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        user: request.user,
      },
    });
  });
}
