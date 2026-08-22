# How to Run Stock Research Platform

Quick guide to get the application running locally.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

The `.env` file has sensible defaults for local development. No changes needed.

### 3. Initialize Admin User

```bash
pnpm seed
```

This creates an initial admin account with:
- **Email:** admin@example.com
- **Password:** Admin@123

### 4. Start the Application

```bash
pnpm dev
```

This starts both frontend and backend servers concurrently.

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:3001

### 5. Login

Visit http://localhost:5173 and login with:

```
Email: admin@example.com
Password: Admin@123
```

---

## Alternative: Run Services Separately

### Frontend Only

```bash
pnpm dev:web
```

Runs on http://localhost:5173

### Backend Only

```bash
pnpm dev:api
```

Runs on http://localhost:3001

---

## Testing

### Run API Tests

```bash
pnpm test:api
```

Tests authentication, authorization, and all API endpoints.

### Run E2E Tests

```bash
pnpm test:e2e
```

Tests complete user workflows using Playwright.

### View E2E Test Results (UI)

```bash
pnpm test:e2e:ui
```

---

## Build for Production

```bash
pnpm build
```

Creates optimized production builds:
- Frontend: `apps/web/dist/`
- Backend: `apps/api/dist/`

---

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

1. Edit `.env`:
```env
API_PORT=3002
WEB_PORT=5174
```

2. Edit `apps/web/vite.config.ts` and change `server.port` to the new port.

3. Restart the application

### Seed Script Fails

Ensure `.env` file exists:
```bash
cp .env.example .env
pnpm seed
```

### Clear Everything and Start Fresh

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm seed
pnpm dev
```

---

## What Can You Do?

### As Admin User

- ✅ Login/Logout
- ✅ View Dashboard
- ✅ View Profile
- ✅ View User Management page
- ✅ Add new users
- ✅ Delete users

### Create Additional Users

1. Login as admin
2. Navigate to "User Management"
3. Click "Add User"
4. Fill in username, email, password
5. Click "Create User"

Then login with the new credentials.

### As Normal User

- ✅ Login/Logout
- ✅ View Dashboard
- ✅ View Profile
- ❌ Cannot access User Management (authorization enforced)

---

## File Structure

- **Frontend:** `apps/web/` - React + Vite application
- **Backend:** `apps/api/` - Fastify server
- **Shared:** `packages/shared/` - Shared types and schemas
- **Tests:** `tests/e2e/` - Playwright E2E tests
- **Config:** `.env` - Environment variables (auto-created)

---

## Next Steps

- Read [README.md](./README.md) for detailed architecture and decisions
- Check test files in `apps/api/src/tests/` for API examples
- View E2E tests in `tests/e2e/tests/` for UI workflow examples

---

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm seed` | Build shared and Create initial admin user |
| `pnpm dev` | Start frontend + backend |
| `pnpm dev:web` | Start frontend only |
| `pnpm dev:api` | Start backend only |
| `pnpm test:api` | Run API tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm build` | Build all pacakages in dependency order |
| `pnpm lint` | Check code quality |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm format` | Auto-format code |

---

**That's it!** You should now have the Stock Research Platform running locally. 🚀
