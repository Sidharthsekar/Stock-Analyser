import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { User } from '@stock-analyser/shared';

interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findBy(predicate: (item: T) => boolean): Promise<T | null>;
}

// Lock mechanism to ensure safe concurrent writes
const locks = new Map<string, Promise<void>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  let resolve: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });

  const existingLock = locks.get(key) ?? Promise.resolve();
  locks.set(key, promise);

  await existingLock;

  try {
    return await fn();
  } finally {
    resolve!();
    locks.delete(key);
  }
}

export class JsonRepository<T extends { id: string }> implements Repository<T> {
  constructor(private readonly filePath: string) {}

  private async ensureDir(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  private async readFile(): Promise<T[]> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeFile(data: T[]): Promise<void> {
    await this.ensureDir();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAll(): Promise<T[]> {
    return withLock(this.filePath, () => this.readFile());
  }

  async getById(id: string): Promise<T | null> {
    return withLock(this.filePath, async () => {
      const items = await this.readFile();
      return items.find((item) => item.id === id) ?? null;
    });
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    return withLock(this.filePath, async () => {
      const items = await this.readFile();
      const newItem = { ...item, id: randomUUID() } as T;
      items.push(newItem);
      await this.writeFile(items);
      return newItem;
    });
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    return withLock(this.filePath, async () => {
      const items = await this.readFile();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }
      const updated = { ...items[index], ...updates } as T;
      items[index] = updated;
      await this.writeFile(items);
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return withLock(this.filePath, async () => {
      const items = await this.readFile();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return false;
      }
      items.splice(index, 1);
      await this.writeFile(items);
      return true;
    });
  }

  async findBy(predicate: (item: T) => boolean): Promise<T | null> {
    return withLock(this.filePath, async () => {
      const items = await this.readFile();
      return items.find(predicate) ?? null;
    });
  }
}

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
}

export class JsonUserRepository extends JsonRepository<User> implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return this.findBy((user) => user.email === email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findBy((user) => user.username === username);
  }
}

export interface SessionRepository extends Repository<{ id: string; userId: string; createdAt: number; expiresAt: number }> {
  findByIdAndUserId(id: string, userId: string): Promise<{ id: string; userId: string; createdAt: number; expiresAt: number } | null>;
  deleteExpired(): Promise<number>;
}

export class JsonSessionRepository extends JsonRepository<{ id: string; userId: string; createdAt: number; expiresAt: number }> implements SessionRepository {
  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<{ id: string; userId: string; createdAt: number; expiresAt: number } | null> {
    return this.findBy((session) => session.id === id && session.userId === userId);
  }

  async deleteExpired(): Promise<number> {
    const withLockKey = this.constructor.name;
    return withLock(withLockKey, async () => {
      const sessions = await this.getAll();
      const now = Date.now();
      const before = sessions.length;
      const filtered = sessions.filter((session) => session.expiresAt > now);
      if (filtered.length < before) {
        // Need to write back - use parent's internal writeFile equivalent
        const dir = path.dirname((this as any).filePath);
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch {
          // Directory might already exist
        }
        await fs.writeFile((this as any).filePath, JSON.stringify(filtered, null, 2), 'utf-8');
      }
      return before - filtered.length;
    });
  }
}
