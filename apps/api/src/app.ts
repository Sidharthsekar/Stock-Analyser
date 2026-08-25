import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { config, isDevelopment } from './config/index.js';
import { JsonUserRepository, JsonSessionRepository } from './repositories/index.js';
import { ArgonAuthService } from './services/auth.service.js';
import { registerAuthRoutes } from './modules/auth/routes.js';
import { registerDashboardRoutes } from './modules/dashboard/routes.js';
import { registerProfileRoutes } from './modules/profile/routes.js';
import { registerUsersRoutes } from './modules/users/routes.js';
import { AppError } from './utils/errors.js';
import { ERROR_CODES, HTTP_STATUS } from '@stock-analyser/shared';
import path from 'path';

const fastify = Fastify({
  logger: isDevelopment(),
});

fastify.register(helmet);
fastify.register(cookie);
fastify.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

const usersPath = path.join(config.dataDirectory, 'users.json');
const sessionsPath = path.join(config.dataDirectory, 'sessions.json');
const userRepository = new JsonUserRepository(usersPath);
const sessionRepository = new JsonSessionRepository(sessionsPath);

const authService = new ArgonAuthService(sessionRepository);

registerAuthRoutes(fastify, authService, userRepository);
registerDashboardRoutes(fastify, authService, userRepository);
registerProfileRoutes(fastify, authService, userRepository);
registerUsersRoutes(fastify, authService, userRepository);

fastify.setErrorHandler((err, _request: FastifyRequest, reply: FastifyReply) => {
  const error = err as unknown;
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (typeof error === 'object' && error !== null && 'validation' in error && Array.isArray((error as Record<string, unknown>).validation)) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'Invalid input',
      },
    });
  }

  if (isDevelopment()) {
    console.error('Unexpected error:', error);
  }

  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isDevelopment() && error instanceof Error ? error.message : 'Internal server error',
    },
  });
});

fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ status: 'ok' });
});

export default fastify;
