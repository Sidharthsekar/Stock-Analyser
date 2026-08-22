import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticatedUser, UserRole } from '@stock-analyser/shared';
import { createAuthenticationError, createAuthorizationError } from '../utils/errors.js';
import type { AuthService } from '../services/auth.service.js';
import type { UserRepository } from '../repositories/index.js';
import { config } from '../config/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

export function createAuthMiddleware(authService: AuthService, userRepository: UserRepository) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionId = request.cookies[config.sessionCookieName];

    if (!sessionId) {
      throw createAuthenticationError();
    }

    const session = await authService.validateSession(sessionId);
    if (!session) {
      reply.clearCookie(config.sessionCookieName);
      throw createAuthenticationError('Your session has expired. Please log in again');
    }

    const user = await userRepository.getById(session.userId);
    if (!user) {
      reply.clearCookie(config.sessionCookieName);
      throw createAuthenticationError();
    }

    request.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    request.sessionId = sessionId;
  };
}

export function createAuthorizationMiddleware(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw createAuthenticationError();
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw createAuthorizationError();
    }
  };
}
