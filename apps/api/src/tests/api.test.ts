import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import fastify from '../../app.js';
import { config } from '../../config/index.js';
import { setupTestData, cleanupTestData, resetTestData } from '../fixtures.js';
import path from 'path';
import { JsonUserRepository } from '../../repositories/index.js';
import { ArgonAuthService } from '../../services/auth.service.js';

const API_BASE_URL = `http://localhost:${config.apiPort}`;
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let adminSessionId: string | null = null;
let normalSessionId: string | null = null;

describe('Authentication', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    // Setup test data
    await setupTestData();

    // Seed initial admin
    const usersPath = path.join(config.testDataDirectory, 'users.json');
    const sessionsPath = path.join(config.testDataDirectory, 'sessions.json');
    const userRepository = new JsonUserRepository(usersPath);
    const { JsonSessionRepository } = await import('../../repositories/index.js');
    const sessionRepository = new JsonSessionRepository(sessionsPath);
    const authService = new ArgonAuthService(userRepository, sessionRepository);

    const passwordHash = await authService.hashPassword('AdminPassword123');
    await userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Start server
    await fastify.listen({ port: config.apiPort, host: '127.0.0.1' });
  });

  afterAll(async () => {
    await fastify.close();
    await cleanupTestData();
  });

  beforeEach(async () => {
    await resetTestData();

    const usersPath = path.join(config.testDataDirectory, 'users.json');
    const sessionsPath = path.join(config.testDataDirectory, 'sessions.json');
    const userRepository = new JsonUserRepository(usersPath);
    const { JsonSessionRepository } = await import('../../repositories/index.js');
    const sessionRepository = new JsonSessionRepository(sessionsPath);
    const authService = new ArgonAuthService(userRepository, sessionRepository);

    const passwordHash = await authService.hashPassword('AdminPassword123');
    await userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  it('should login with valid credentials', async () => {
    const response = await apiClient.post('/api/auth/login', {
      email: 'admin@example.com',
      password: 'AdminPassword123',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.email).toBe('admin@example.com');
    expect(response.data.data.user.role).toBe('admin');

    // Check cookie
    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toContain(config.sessionCookieName);
  });

  it('should reject login with invalid email', async () => {
    try {
      await apiClient.post('/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'AdminPassword123',
      });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
      expect(error.response?.data.error.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('should reject login with invalid password', async () => {
    try {
      await apiClient.post('/api/auth/login', {
        email: 'admin@example.com',
        password: 'WrongPassword',
      });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
      expect(error.response?.data.error.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('should logout successfully', async () => {
    // First login
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: 'admin@example.com',
      password: 'AdminPassword123',
    });

    const cookies = loginResponse.headers['set-cookie'];
    const sessionCookie = cookies?.[0];

    // Create new client with cookies
    const authenticatedClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        Cookie: sessionCookie,
      },
    });

    // Logout
    const logoutResponse = await authenticatedClient.post('/api/auth/logout');
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.data.success).toBe(true);
  });

  it('should reject access without authentication', async () => {
    try {
      await apiClient.get('/api/dashboard');
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
      expect(error.response?.data.error.code).toBe('AUTHENTICATION_REQUIRED');
    }
  });
});

describe('Authorization', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await setupTestData();

    const usersPath = path.join(config.testDataDirectory, 'users.json');
    const sessionsPath = path.join(config.testDataDirectory, 'sessions.json');
    const userRepository = new JsonUserRepository(usersPath);
    const { JsonSessionRepository } = await import('../../repositories/index.js');
    const sessionRepository = new JsonSessionRepository(sessionsPath);
    const authService = new ArgonAuthService(userRepository, sessionRepository);

    const passwordHash = await authService.hashPassword('AdminPassword123');
    await userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await fastify.listen({ port: config.apiPort, host: '127.0.0.1' });
  });

  afterAll(async () => {
    await fastify.close();
    await cleanupTestData();
  });

  beforeEach(async () => {
    await resetTestData();

    const usersPath = path.join(config.testDataDirectory, 'users.json');
    const sessionsPath = path.join(config.testDataDirectory, 'sessions.json');
    const userRepository = new JsonUserRepository(usersPath);
    const { JsonSessionRepository } = await import('../../repositories/index.js');
    const sessionRepository = new JsonSessionRepository(sessionsPath);
    const authService = new ArgonAuthService(userRepository, sessionRepository);

    const adminHash = await authService.hashPassword('AdminPassword123');
    const userHash = await authService.hashPassword('UserPassword123');

    await userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await userRepository.create({
      username: 'normaluser',
      email: 'user@example.com',
      passwordHash: userHash,
      role: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  it('should allow normal user to access dashboard', async () => {
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: 'user@example.com',
      password: 'UserPassword123',
    });

    const cookies = loginResponse.headers['set-cookie'];
    const authenticatedClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        Cookie: cookies?.[0],
      },
    });

    const response = await authenticatedClient.get('/api/dashboard');
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it('should reject normal user access to user management', async () => {
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: 'user@example.com',
      password: 'UserPassword123',
    });

    const cookies = loginResponse.headers['set-cookie'];
    const authenticatedClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        Cookie: cookies?.[0],
      },
    });

    try {
      await authenticatedClient.get('/api/users');
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(403);
      expect(error.response?.data.error.code).toBe('FORBIDDEN');
    }
  });

  it('should allow admin to access user management', async () => {
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: 'admin@example.com',
      password: 'AdminPassword123',
    });

    const cookies = loginResponse.headers['set-cookie'];
    const authenticatedClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        Cookie: cookies?.[0],
      },
    });

    const response = await authenticatedClient.get('/api/users');
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.users)).toBe(true);
  });
});
