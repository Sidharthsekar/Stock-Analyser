import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { JsonUserRepository, JsonSessionRepository } from '../repositories/index.js';
import { ArgonAuthService } from '../services/auth.service.js';
import { USER_ROLES } from '@stock-analyser/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const usersPath = path.join(config.dataDirectory, 'users.json');
const sessionsPath = path.join(config.dataDirectory, 'sessions.json');
const userRepository = new JsonUserRepository(usersPath);
const sessionRepository = new JsonSessionRepository(sessionsPath);
const authService = new ArgonAuthService(userRepository, sessionRepository);

async function seed() {
  console.log('🌱 Seeding initial admin user...');

  // Check if admin already exists
  const existingAdmin = await userRepository.findByEmail(config.adminEmail);
  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    process.exit(0);
  }

  // Create admin user
  const passwordHash = await authService.hashPassword(config.adminPassword);
  const admin = await userRepository.create({
    username: config.adminUsername,
    email: config.adminEmail,
    passwordHash,
    role: USER_ROLES.ADMIN,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.log(`✅ Admin user created successfully`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Username: ${admin.username}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
