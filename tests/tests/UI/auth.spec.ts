import { test, expect } from '@playwright/test';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE_URL = 'http://localhost:3001';

async function seedDatabase() {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Clean up by resetting test data
  try {
    // Create admin user for testing
    await apiClient.post('/api/users', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123',
    });
  } catch {
    // User might already exist
  }
}

test.beforeEach(async ({ page, context }) => {
  await seedDatabase();
  // Clear cookies before each test
  await context.clearCookies();
});

test('Login with valid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.waitForURL('/dashboard');
  await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
});

test('Login with invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'WrongPassword');
  await page.click('[data-testid="login-submit"]');

  await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('Logout functionality', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.waitForURL('/dashboard');

  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login');
});

test('Access dashboard as authenticated user', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.waitForURL('/dashboard');
  const welcomeText = await page.locator('[data-testid="dashboard-welcome"]').textContent();
  expect(welcomeText).toContain('Welcome');
});

test('View profile as authenticated user', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.click('[data-testid="navigation-profile"]');
  await page.waitForURL('/profile');

  await expect(page.locator('[data-testid="profile-username"]')).toBeVisible();
  await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
  await expect(page.locator('[data-testid="profile-role"]')).toBeVisible();
  await expect(page.locator('[data-testid="profile-created-at"]')).toBeVisible();
});

test('Admin can access user management', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.waitForURL('/dashboard');
  await expect(page.locator('[data-testid="navigation-users"]')).toBeVisible();

  await page.click('[data-testid="navigation-users"]');
  await page.waitForURL('/users');

  await expect(page.locator('[data-testid="users-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  await expect(page.locator('[data-testid="users-add-button"]')).toBeVisible();
});

test('Admin can add a user', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.click('[data-testid="navigation-users"]');
  await page.waitForURL('/users');

  await page.click('[data-testid="users-add-button"]');

  const newEmail = `user-${Date.now()}@example.com`;
  await page.fill('[data-testid="add-user-username"]', `testuser-${Date.now()}`);
  await page.fill('[data-testid="add-user-email"]', newEmail);
  await page.fill('[data-testid="add-user-password"]', 'TestPassword123');

  await page.click('[data-testid="add-user-submit"]');

  await page.waitForTimeout(500);
  const tableContent = await page.locator('[data-testid="users-table"]').textContent();
  expect(tableContent).toContain(newEmail);
});

test('Admin can delete a user', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="login-email"]', 'admin@example.com');
  await page.fill('[data-testid="login-password"]', 'AdminPassword123');
  await page.click('[data-testid="login-submit"]');

  // First create a user to delete
  const newEmail = `user-${Date.now()}@example.com`;
  const newUsername = `testuser-${Date.now()}`;

  await page.click('[data-testid="navigation-users"]');
  await page.waitForURL('/users');

  await page.click('[data-testid="users-add-button"]');
  await page.fill('[data-testid="add-user-username"]', newUsername);
  await page.fill('[data-testid="add-user-email"]', newEmail);
  await page.fill('[data-testid="add-user-password"]', 'TestPassword123');
  await page.click('[data-testid="add-user-submit"]');

  await page.waitForTimeout(500);

  // Find and delete the user
  const tableRows = await page.locator('[data-testid^="users-row-"]').all();
  for (const row of tableRows) {
    const text = await row.textContent();
    if (text?.includes(newEmail)) {
      const deleteButton = row.locator('button:has-text("Delete")');
      await deleteButton.click();
      await page.click('button:has-text("Confirm")');
      break;
    }
  }

  await page.waitForTimeout(500);
  const tableContent = await page.locator('[data-testid="users-table"]').textContent();
  expect(tableContent).not.toContain(newEmail);
});

test('Normal user cannot access user management', async ({ page }) => {
  await page.goto('/login');

  // First create a normal user
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Login as admin first
  const adminLogin = await apiClient.post('/api/auth/login', {
    email: 'admin@example.com',
    password: 'AdminPassword123',
  });

  const adminCookie = adminLogin.headers['set-cookie']?.[0];

  // Create normal user
  const normalEmail = `normaluser-${Date.now()}@example.com`;
  const adminClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      Cookie: adminCookie,
    },
  });

  await adminClient.post('/api/users', {
    username: `normaluser-${Date.now()}`,
    email: normalEmail,
    password: 'NormalPassword123',
  });

  // Login as normal user
  await page.goto('/login');
  await page.fill('[data-testid="login-email"]', normalEmail);
  await page.fill('[data-testid="login-password"]', 'NormalPassword123');
  await page.click('[data-testid="login-submit"]');

  await page.waitForURL('/dashboard');

  // Check that User Management is not visible
  const userManagementLink = page.locator('[data-testid="navigation-users"]');
  await expect(userManagementLink).not.toBeVisible();

  // Try direct navigation
  await page.goto('/users');
  // Should be redirected or show error
  const url = page.url();
  expect(url).toContain('/dashboard');
});

test('Unauthenticated user redirected to login', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForURL('/login');
  expect(page.url()).toContain('/login');
});
