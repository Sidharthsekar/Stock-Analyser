import Fastify from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { config, isDevelopment } from './config/index.js';
import { JsonUserRepository, JsonSessionRepository } from './repositories/index.js';
import { ArgonAuthService } from './services/auth.service.js';
import { registerAuthRoutes } from './modules/auth/routes.js';
import { registerDashboardRoutes } from './modules/dashboard/routes.js';
import { registerProfileRoutes } from './modules/profile/routes.js';
import { registerUsersRoutes } from './modules/users/routes.js';
import { AppError } from './utils/errors.js';
import { isDevelopment as isDev } from './config/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
  logger: isDevelopment(),
});

// Security plugins
fastify.register(helmet);
fastify.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

// Initialize repositories
const usersPath = path.join(config.dataDirectory, 'users.json');
const sessionsPath = path.join(config.dataDirectory, 'sessions.json');
const userRepository = new JsonUserRepository(usersPath);
const sessionRepository = new JsonSessionRepository(sessionsPath);

// Initialize auth service
const authService = new ArgonAuthService(userRepository, sessionRepository);

// Register routes
registerAuthRoutes(fastify, authService, userRepository);
registerDashboardRoutes(fastify, authService, userRepository);
registerProfileRoutes(fastify, authService, userRepository);
registerUsersRoutes(fastify, authService, userRepository);

// Error handling
fastify.setErrorHandler((error, _request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Validation error from Fastify
  if ('validation' in error && Array.isArray((error as any).validation)) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid input',
      },
    });
  }

  // Log unexpected errors
  if (isDev()) {
    console.error('Unexpected error:', error);
  }

  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev() ? (error as Error).message : 'Internal server error',
    },
  });
});

// Health check endpoint
fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ status: 'ok' });
});

export default fastify;
