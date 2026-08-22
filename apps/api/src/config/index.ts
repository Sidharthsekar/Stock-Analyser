import process from 'process';

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const config = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  apiPort: parseInt(getEnv('API_PORT', '3001'), 10),
  webPort: parseInt(getEnv('WEB_PORT', '5173'), 10),
  sessionCookieName: getEnv('SESSION_COOKIE_NAME', 'session'),
  sessionTimezone: getEnv('SESSION_TIMEZONE', 'Asia/Kolkata'),
  sessionCookieSecure: getEnv('SESSION_COOKIE_SECURE', 'false') === 'true',
  sessionCookieSameSite: getEnv('SESSION_COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none',
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  dataDirectory: getEnv('DATA_DIRECTORY', './data'),
  testDataDirectory: getEnv('TEST_DATA_DIRECTORY', './test-data'),
  adminEmail: getEnv('ADMIN_EMAIL', 'admin@example.com'),
  adminPassword: getEnv('ADMIN_PASSWORD', ''),
  adminUsername: getEnv('ADMIN_USERNAME', 'admin'),
} as const;

export function isDevelopment(): boolean {
  return config.nodeEnv === 'development';
}

export function isProduction(): boolean {
  return config.nodeEnv === 'production';
}

export function isTest(): boolean {
  return config.nodeEnv === 'test';
}
