# Stock Research Platform - Foundation

A production-quality, lightweight TypeScript monorepo for stock market research and analysis. This is the **initial foundation only** - no stock-market functionality has been implemented yet.

## Project Overview

This application implements the core infrastructure needed for a future stock research platform:

- ✅ User authentication with secure HttpOnly sessions
- ✅ Authorization with admin and user roles
- ✅ Daily automatic session expiration
- ✅ User management (admin-only)
- ✅ Clean REST API
- ✅ Lightweight React frontend
- ✅ Comprehensive testing

**Not implemented (intentionally):**

- Stock prices, charts, or market data
- Watchlists, portfolios, or screeners
- Technical or fundamental analysis
- News feeds or research tools
- Any stock-specific features

The architecture is designed so these features can be added later without major restructuring.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication

### Backend
- **Fastify** for HTTP server
- **TypeScript** for type safety
- **Argon2id** for secure password hashing
- **Zod** for validation
- **HttpOnly cookies** for session management

### Testing
- **Vitest** for API tests
- **Playwright** for E2E UI tests
- **Axios** for API test client

### Infrastructure
- **pnpm workspaces** for monorepo management
- **JSON file storage** for users and sessions
- **Concurrent-safe locking** for file operations
- **Timezone-aware** session expiration

## Architecture

```
React/Vite Frontend
        ↓
   (CORS)
        ↓
   Fastify API
        ↓
   Services
        ↓
   Repositories
        ↓
   JSON Storage
```

### Repository Pattern

The backend uses repository abstractions to separate business logic from storage:

```typescript
UserRepository interface
    ↓
JsonUserRepository (JSON implementation)
    ↓
users.json (with concurrent-safe locking)
```

This design allows replacing JSON storage with PostgreSQL later without changing business logic.

### Session Architecture

Sessions use HttpOnly cookies for maximum security:

```
Login Request
     ↓
Validate credentials
     ↓
Hash password (Argon2id)
     ↓
Create session (stored in JSON)
     ↓
Set HttpOnly cookie
     ↓
Browser keeps cookie (cannot access via JavaScript)
     ↓
Subsequent requests
     ↓
Server validates session on every authenticated request
     ↓
Check expiration (end-of-day in configured timezone)
```

### Daily Session Expiration

Sessions expire at the end of the calendar day (midnight) in the configured timezone:

- Login at 10:00 AM → session valid until midnight
- At midnight → session automatically invalid
- User must log in again the next day
- Backend validates expiration on **every** authenticated request
- Frontend interceptor detects 401 responses and shows expiration message

## Project Structure

```
root/
├── apps/
│   ├── web/                 # React + Vite frontend
│   │   ├── src/
│   │   │   ├── features/    # Feature-based organization
│   │   │   ├── layouts/     # Shared layouts
│   │   │   ├── lib/         # Utilities and API client
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                 # Fastify backend
│       ├── src/
│       │   ├── modules/     # Feature modules
│       │   │   ├── auth/    # Authentication
│       │   │   ├── dashboard/
│       │   │   ├── profile/
│       │   │   └── users/   # Admin user management
│       │   ├── repositories/ # Data access layer
│       │   ├── services/    # Business logic
│       │   ├── middleware/  # Auth/auth middleware
│       │   ├── config/      # Configuration
│       │   ├── utils/       # Helpers
│       │   ├── tests/       # API tests
│       │   ├── scripts/     # Seed script
│       │   ├── app.ts       # Fastify app setup
│       │   └── server.ts    # Server entry
│       ├── vitest.config.ts
│       └── package.json
│
├── packages/
│   └── shared/              # Shared types and schemas
│       ├── src/
│       │   ├── types.ts     # Shared TypeScript types
│       │   ├── schemas.ts   # Zod validation schemas
│       │   ├── constants.ts # Constants
│       │   └── index.ts     # Exports
│       └── package.json
│
├── tests/
│   └── e2e/                 # Playwright E2E tests
│       ├── tests/
│       │   └── auth.spec.ts
│       ├── playwright.config.ts
│       └── package.json
│
├── data/                    # Production data (git-ignored)
│   ├── users.json
│   └── sessions.json
│
├── test-data/               # Test data (git-ignored)
│   ├── users.json
│   └── sessions.json
│
├── package.json             # Root package
├── pnpm-workspace.yaml      # Workspace config
├── tsconfig.json            # Root TypeScript config
├── .eslintrc.json          # ESLint config
├── .prettierrc              # Prettier config
├── .gitignore              # Git config
├── .env.example            # Environment template
└── README.md               # This file
```

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher

Install pnpm globally:

```bash
npm install -g pnpm
```

## Installation

1. Clone the repository:

```bash
git clone <repository>
cd Stock-Analyser
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment:

```bash
cp .env.example .env
# Edit .env if needed (defaults are suitable for development)
```

4. Initialize admin user:

```bash
pnpm seed
```

This creates the initial admin user with credentials from `.env`:

```
Email: admin@example.com
Password: AdminPassword123
Username: admin
```

## Development

Start all services in development mode:

```bash
pnpm dev
```

This runs both frontend and backend concurrently.

### Frontend Only

Start the React development server:

```bash
pnpm dev:web
```

Runs on: http://localhost:5173

### Backend Only

Start the Fastify server:

```bash
pnpm dev:api
```

Runs on: http://localhost:3001

API documentation available at: http://localhost:3001/api/docs

### Demo Credentials

Use these credentials to log in during development:

```
Email: admin@example.com
Password: AdminPassword123
```

Or create additional users through the User Management interface.

## Testing

### API Tests

Run API tests with Vitest:

```bash
pnpm test:api
```

Tests cover:
- Authentication (login, logout, session validation)
- Authorization (admin vs user access)
- User management operations
- Error handling
- Concurrent access safety

### E2E Tests

Run Playwright E2E tests:

```bash
pnpm test:e2e
```

Tests cover:
- Login workflows (valid and invalid)
- Logout
- Dashboard access
- Profile viewing
- User management workflows
- Authorization constraints
- Session expiration
- Unauthenticated redirects

View test results in HTML:

```bash
pnpm test:e2e:ui
```

## Building

Build all packages:

```bash
pnpm build
```

Outputs:
- Frontend: `apps/web/dist/`
- Backend: `apps/api/dist/`
- Shared: `packages/shared/dist/`

## Code Quality

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

## API Endpoints

### Authentication

```
POST   /api/auth/login      - Login with email/password
POST   /api/auth/logout     - Logout (requires auth)
GET    /api/auth/me         - Get current user (requires auth)
```

### Dashboard

```
GET    /api/dashboard       - Get dashboard data (requires auth)
```

### Profile

```
GET    /api/profile         - Get current user profile (requires auth)
```

### User Management (admin only)

```
GET    /api/users           - List all users
POST   /api/users           - Create new user
DELETE /api/users/:id       - Delete user
```

### Infrastructure

```
GET    /health              - Health check (no auth required)
```

## Authentication & Authorization

### Authentication Flow

1. User logs in with email and password
2. Backend validates credentials
3. If valid, creates a session and sets HttpOnly cookie
4. Cookie is automatically included in subsequent requests
5. Backend validates session on every authenticated request
6. If session expired, returns 401 with "session expired" message

### Authorization Matrix

| Function | Unauthenticated | User | Admin |
|----------|:-:|:-:|:-:|
| Login | ✅ | ✅ | ✅ |
| Logout | ❌ | ✅ | ✅ |
| View own profile | ❌ | ✅ | ✅ |
| View dashboard | ❌ | ✅ | ✅ |
| View users | ❌ | ❌ | ✅ |
| Add user | ❌ | ❌ | ✅ |
| Delete user | ❌ | ❌ | ✅ |

### Security Features

- ✅ HttpOnly cookies (cannot be accessed by JavaScript)
- ✅ SameSite cookie protection
- ✅ Secure cookie flag (in production)
- ✅ CORS configuration
- ✅ Argon2id password hashing
- ✅ Session validation on every request
- ✅ Passwords never logged or exposed
- ✅ Structured error responses (no stack traces)

## Environment Variables

```env
# Server
NODE_ENV=development                   # development | production | test
API_PORT=3001
WEB_PORT=5173

# Session
SESSION_COOKIE_NAME=session            # Cookie name
SESSION_TIMEZONE=Asia/Kolkata          # End-of-day timezone
SESSION_COOKIE_SECURE=false            # true in production
SESSION_COOKIE_SAME_SITE=lax           # lax | strict | none

# CORS
CORS_ORIGIN=http://localhost:5173     # Frontend URL

# Storage
DATA_DIRECTORY=./data                 # Production data directory
TEST_DATA_DIRECTORY=./test-data       # Test data directory

# Initial Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123
ADMIN_USERNAME=admin
```

## Concurrent Access

The application safely handles concurrent requests with multiple users:

- **File locking mechanism** prevents race conditions when writing to JSON files
- **Reads don't block** other reads or writes
- **Writes are serialized** per file to ensure data integrity
- **Lock timeout protection** prevents deadlocks

This design scales safely for typical workloads and provides a foundation for database migration.

## Extending the Application

### Adding a New Module

1. Create a new directory in `apps/api/src/modules/[module-name]/`
2. Create `routes.ts` file with Fastify routes
3. Register routes in `app.ts`
4. Add shared types to `packages/shared/src/types.ts`
5. Add validation schemas to `packages/shared/src/schemas.ts`

### Future Stock Features

The following can be added without major restructuring:

- Market data APIs
- Stock screeners
- Watchlists
- Portfolio tracking
- Research notes
- News integration
- Technical analysis
- Fundamental analysis

Each feature can follow the module pattern already established.

## Security Considerations

### What This Implementation Covers

- ✅ Secure password storage (Argon2id)
- ✅ Session-based authentication (HttpOnly cookies)
- ✅ CORS protection
- ✅ Input validation (Zod)
- ✅ Authorization enforcement
- ✅ Sensitive data exclusion from responses
- ✅ Basic security headers

### What To Add for Production

- [ ] HTTPS enforcement
- [ ] Rate limiting on login
- [ ] Database encryption at rest
- [ ] Audit logging
- [ ] Admin activity monitoring
- [ ] Two-factor authentication
- [ ] Password reset/recovery flow
- [ ] Email verification
- [ ] Session revocation on password change
- [ ] API key management
- [ ] Data backup and recovery

## Performance Considerations

### Frontend

- Lightweight CSS framework (Tailwind)
- No unnecessary animations
- No large image assets
- Minimal dependencies
- Route-based code splitting ready
- ~50KB gzipped bundle target

### Backend

- Async request handling
- Efficient session validation
- Concurrent-safe file operations
- No unnecessary data loading
- Structured logging

## Troubleshooting

### Port Already in Use

If port 3001 (API) or 5173 (Web) is in use:

```bash
# Change in .env
API_PORT=3002
WEB_PORT=5174
```

### Seed Script Fails

Ensure environment variables are set:

```bash
pnpm seed
# If fails, check .env file exists and ADMIN_PASSWORD is set
```

### Tests Fail

Clean and reinstall:

```bash
pnpm clean  # If available
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm seed
pnpm test:api
```

### Session Expires Immediately

Check timezone configuration in `.env`:

```bash
SESSION_TIMEZONE=Asia/Kolkata  # Or your local timezone
```

## Git Workflow

The `.gitignore` excludes:

- `node_modules/`
- `dist/`, `build/`
- `.env` (actual secrets)
- `data/` (production user data)
- `test-data/` (test data)
- `coverage/`, `artifacts/`
- IDE/editor files

Commit safely:

```bash
git add .
git status  # Verify .env and data/ are excluded
git commit -m "Your message"
```

## Architecture Decisions

### Why React + Vite?

- Fast development experience
- Excellent TypeScript support
- No server-side rendering overhead needed
- Small, optimizable bundles
- Active ecosystem

### Why Fastify?

- High performance HTTP server
- Excellent TypeScript support
- Plugin ecosystem
- Lightweight and focused
- Great for microservices

### Why Argon2id?

- Memory-hard hashing (resistant to GPU attacks)
- Industry standard for password storage
- Configurable time/memory costs
- Available in Node.js (argon2 package)

### Why HttpOnly Cookies?

- Cannot be accessed by JavaScript (XSS protection)
- Automatically included in requests (no refresh token logic)
- Server is the authority (cannot be forged by client)
- Simple and secure session management

### Why JSON Storage?

- Foundation only - easy to switch to database later
- Simpler than setting up PostgreSQL initially
- Concurrent-safe implementation included
- Repository pattern makes migration straightforward
- Suitable for typical workloads

### Why Zod?

- Runtime validation matches TypeScript types
- Excellent error messages
- Composable schemas
- No code generation needed
- Lightweight

## Testing Strategy

### Unit & Integration (API Tests)

- Test every API endpoint
- Validate authentication flows
- Verify authorization rules
- Check error handling
- Use isolated test data

### End-to-End (Playwright)

- Test real user workflows
- Verify navigation
- Check UI interactions
- Validate redirects
- Test with real API responses

Tests run against actual running services, not mocks.

## Future Roadmap

### Phase 2: Database
- Replace JSON repositories with PostgreSQL
- Add migration system
- Implement connection pooling
- Add database backup strategy

### Phase 3: Features
- Add stock data APIs
- Implement screeners
- Build watchlist functionality
- Add portfolio tracking

### Phase 4: Scale
- Implement caching (Redis)
- Add background jobs (Bull)
- Implement WebSocket for real-time data
- Add monitoring and observability

## Contributing

When extending this codebase:

1. Follow the module pattern (one feature = one module)
2. Use TypeScript strict mode
3. Add tests for new features
4. Validate all external input with Zod
5. Use repository abstractions for data access
6. Add meaningful `data-testid` attributes for testable UIs

## License

This is a foundation project for stock market research applications.

## Support

For issues or questions:

1. Check the README sections above
2. Review the code in `apps/api/src/modules/` for patterns
3. Look at tests for usage examples
4. Check environment configuration in `.env.example`
Stock Analyser agent
