import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupTestData() {
  const testDataDir = config.testDataDirectory;

  // Create test data directory
  await fs.mkdir(testDataDir, { recursive: true });

  // Create empty users.json and sessions.json
  const usersPath = path.join(testDataDir, 'users.json');
  const sessionsPath = path.join(testDataDir, 'sessions.json');

  if (!(await fileExists(usersPath))) {
    await fs.writeFile(usersPath, '[]', 'utf-8');
  }

  if (!(await fileExists(sessionsPath))) {
    await fs.writeFile(sessionsPath, '[]', 'utf-8');
  }
}

export async function cleanupTestData() {
  const testDataDir = config.testDataDirectory;
  try {
    await fs.rm(testDataDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resetTestData() {
  const usersPath = path.join(config.testDataDirectory, 'users.json');
  const sessionsPath = path.join(config.testDataDirectory, 'sessions.json');

  await fs.writeFile(usersPath, '[]', 'utf-8');
  await fs.writeFile(sessionsPath, '[]', 'utf-8');
}
