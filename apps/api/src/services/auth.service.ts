import { hash, verify } from 'argon2';
import { randomUUID } from 'crypto';
import { getTimeZone, startOfNextDay } from '../utils/timezone.js';
import type { User, Session, AuthenticatedUser } from '@stock-analyser/shared';
import type { UserRepository, SessionRepository } from '../repositories/index.js';

export interface AuthService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  createSession(userId: string, timezone: string): Promise<Session>;
  validateSession(sessionId: string): Promise<Session | null>;
  invalidateSession(sessionId: string): Promise<void>;
  getSessionExpirationTime(timezone: string): number;
}

export class ArgonAuthService implements AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hash(password, {
      type: 2,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  async createSession(userId: string, timezone: string): Promise<Session> {
    const now = Date.now();
    const expiresAt = startOfNextDay(timezone);

    const session = await this.sessionRepository.create({
      userId,
      createdAt: now,
      expiresAt,
    });

    return session;
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionRepository.getById(sessionId);

    if (!session) {
      return null;
    }

    const now = Date.now();
    if (session.expiresAt < now) {
      await this.sessionRepository.delete(sessionId);
      return null;
    }

    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  getSessionExpirationTime(timezone: string): number {
    return startOfNextDay(timezone);
  }
}
