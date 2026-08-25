import { hash, verify } from 'argon2';
import { startOfNextDay } from '../utils/timezone.js';
import type { Session } from '@stock-analyser/shared';
import type { SessionRepository } from '../repositories/index.js';

export interface AuthService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  createSession(userId: string, timezone: string): Promise<Session>;
  validateSession(sessionId: string): Promise<Session | null>;
  invalidateSession(sessionId: string): Promise<void>;
}

export class ArgonAuthService implements AuthService {
  constructor(
    private readonly sessionRepository: SessionRepository
  ) { }

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
    return this.sessionRepository.create({
      userId,
      createdAt: Date.now(),
      expiresAt: startOfNextDay(timezone),
    });
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionRepository.getById(sessionId);

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      await this.sessionRepository.delete(sessionId);
      return null;
    }

    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

}
