# Build a Lightweight TypeScript Monorepo Web Application for Stock Market Research

## 1. Objective

Create a production-quality, lightweight, extensible web application that will eventually be used for **stock-market-related research and analysis**.

This is the **initial foundation only**.

Do **NOT** implement any stock-market functionality yet. The application must only implement:

1. User login
2. User logout
3. Daily session expiration
4. Empty/welcome dashboard
5. User profile view
6. Admin user management
   - View users
   - Add users
   - Delete users
7. Authentication and authorization
8. API tests
9. Playwright UI/E2E tests

The architecture must be designed so that stock-market features can be added later without requiring a major restructuring of the application.

---

# 2. Mandatory Original Requirements

The following requirements are mandatory and must not be omitted or weakened:

### Authentication

- Every API endpoint must require authentication by default.
- The only APIs allowed without authentication are the minimum APIs required to establish authentication, specifically the login endpoint.
- Logout must invalidate the current session.
- Authentication must use secure server-side sessions with an **HttpOnly cookie**.
- Do NOT store authentication tokens in `localStorage`.
- Do NOT use client-side JWT storage.
- Passwords must never be stored as plaintext.
- Use **Argon2id** for password hashing.

### Session

- Login sessions must automatically expire at the end of the day.
- Treat "daily session logout" as **end-of-day expiration**, not 24 hours from login.
- Example:
  - Login at 10:00 AM → session remains valid during that day.
  - At midnight → session becomes invalid.
  - User must log in again the next day.
- Backend must validate session expiration on every authenticated request.
- Logout must explicitly invalidate the session.

### Lightweight Application

The application must be intentionally lightweight.

Do NOT add:

- Unnecessary animations
- Decorative animations
- Heavy image assets
- Background videos
- Large unnecessary UI libraries
- Unnecessary client-side dependencies
- Complex state-management libraries unless genuinely required
- Stock charts or visualization libraries at this stage

Prefer simple HTML/CSS-based UI components.

The application should load quickly and have a small frontend footprint.

---

# 3. Technology Stack

Use the following stack exactly unless there is a strong technical reason that requires a change.

## Monorepo

Use:

- pnpm workspaces

Structure:

```text
root/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   └── shared/
│
├── data/
├── tests/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

---

# 4. Frontend

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui selectively

Do not use Next.js.

This is intentionally a client-side application because SSR is not required at this stage.

The frontend should be structured by feature/module.

Example:

```text
apps/web/
├── src/
│   ├── app/
│   ├── components/
│   ├── layouts/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── users/
│   ├── lib/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── vite.config.ts
```

Keep components small and reusable.

---

# 5. Backend

Use:

- Fastify
- TypeScript

Do not use Express.

The backend must be designed to support multiple simultaneous users and concurrent requests.

Structure the backend using a module-oriented architecture:

```text
apps/api/
├── src/
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── users/
│   ├── middleware/
│   ├── plugins/
│   ├── repositories/
│   ├── services/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

Future modules should be able to follow the same structure.

Potential future modules include:

```text
stocks/
filings/
financials/
news/
screeners/
watchlists/
research/
portfolio/
```

Do not implement these now.

---

# 6. Shared Package

Create:

```text
packages/shared/
```

Use it for code that genuinely needs to be shared between frontend and backend.

Examples:

- TypeScript types
- Zod schemas
- API request/response types
- User roles
- Common constants

Example:

```text
packages/shared/
├── src/
│   ├── schemas/
│   ├── types/
│   ├── constants/
│   └── index.ts
└── package.json
```

Do not duplicate API contracts unnecessarily between frontend and backend.

---

# 7. Validation

Use **Zod**.

All externally supplied data must be validated.

Validate:

- Login request
- User creation request
- User IDs
- Profile-related inputs where applicable
- API query/path parameters
- Environment configuration where practical

Do not trust data coming from the browser.

---

# 8. Authentication Architecture

Use **server-side session authentication using HttpOnly cookies**.

Do not use:

```text
localStorage JWT
sessionStorage JWT
JWT stored in JavaScript-accessible cookies
```

Preferred flow:

```text
Browser
   │
   │ POST /api/auth/login
   ▼
Fastify
   │
   ├── Validate credentials
   ├── Verify Argon2id password hash
   ├── Create session
   └── Set HttpOnly cookie
   │
   ▼
Browser
```

For subsequent requests:

```text
Browser
   │
   │ HttpOnly session cookie
   ▼
Fastify authentication middleware
   │
   ├── Validate session
   ├── Check expiration
   ├── Load user
   └── Authorize request
```

---

# 9. Session Data

Since there is no database yet, sessions can be persisted in JSON.

Use:

```text
data/
├── users.json
└── sessions.json
```

However, do not design the application so that business logic directly reads/writes these files.

Use repository abstractions.

For example:

```text
UserRepository
SessionRepository
```

with implementations:

```text
JsonUserRepository
JsonSessionRepository
```

This is important because the JSON storage can later be replaced by PostgreSQL or another database.

---

# 10. Concurrent User Support

The backend must support multiple users making requests concurrently.

Pay particular attention to JSON file writes.

Do NOT implement unsafe code such as:

```text
read file
modify object
write file
```

without considering concurrent writes.

Implement appropriate serialization/locking around writes.

Reads should not unnecessarily block other users.

The application must not corrupt `users.json` or `sessions.json` when multiple requests happen concurrently.

Design this storage layer so that replacing it with a real database later is straightforward.

---

# 11. User Model

Use a model similar to:

```text
User
├── id
├── username
├── email
├── passwordHash
├── role
├── createdAt
└── updatedAt
```

Roles:

```text
admin
user
```

There must initially be exactly one administrator account.

Do not allow normal users to create administrators.

The initial admin account should be configurable through environment variables or a secure initialization mechanism.

Do not hardcode a real password into source code.

---

# 12. User Management

Only administrators can access User Management.

Admin functionality:

### View users

Display:

- Username
- Email
- Role
- Created date
- Actions

### Add user

Admin should be able to create a normal user.

Required fields:

- Username
- Email
- Password

New users must always be created with:

```text
role = user
```

Do not provide a UI option to create another admin.

### Delete user

Admin can delete normal users.

Important:

- Admin cannot delete themselves.
- Admin cannot delete the last administrator.
- Normal users cannot access user-management APIs.
- Normal users must receive an authorization error if they attempt to access admin APIs.

No edit-user functionality is required at this stage.

No password-reset functionality is required at this stage.

No enable/disable functionality is required at this stage.

---

# 13. Authorization Matrix

Implement explicit authorization.

| Function | Unauthenticated | Normal User | Admin |
|---|---:|---:|---:|
| Login | Yes | Yes | Yes |
| Logout | No | Yes | Yes |
| View own profile | No | Yes | Yes |
| View dashboard | No | Yes | Yes |
| View users | No | No | Yes |
| Add user | No | No | Yes |
| Delete user | No | No | Yes |

All APIs must reject unauthenticated requests except login.

Use appropriate HTTP status codes:

```text
401 Unauthorized
```

for missing/invalid authentication.

Use:

```text
403 Forbidden
```

for authenticated users who lack permission.

---

# 14. API Design

Create a clean REST API.

Suggested endpoints:

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/dashboard

GET    /api/profile

GET    /api/users
POST   /api/users
DELETE /api/users/:id
```

Do not create unnecessary APIs.

Every API except login must be authenticated.

If `/api/auth/me` is considered part of authentication bootstrap, it still requires an authenticated session.

---

# 15. API Response Format

Use a consistent API response structure.

For example:

```json
{
  "success": true,
  "data": {}
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication is required"
  }
}
```

Do not expose:

- Password hashes
- Session IDs
- Internal filesystem information
- Stack traces
- Sensitive implementation details

to the frontend.

---

# 16. Error Handling

Implement centralized Fastify error handling.

Handle:

- Validation errors
- Authentication errors
- Authorization errors
- Resource-not-found errors
- Duplicate users
- Invalid credentials
- Expired sessions
- JSON storage errors
- Unexpected internal errors

Do not expose raw exception messages to clients in production mode.

Use structured server-side logging.

---

# 17. Security

Implement reasonable security protections from the beginning.

Include:

- HttpOnly cookies
- Secure cookie configuration appropriate to environment
- SameSite cookie configuration
- CORS configuration
- Security headers
- Login rate limiting
- Input validation
- Password hashing with Argon2id
- No password logging
- No session ID logging
- No sensitive information in API responses

Configure development and production behavior separately.

---

# 18. Daily Session Expiration

The session must expire at the end of the calendar day.

Store an explicit expiration timestamp.

For example:

```text
createdAt
expiresAt
```

If a session is created on:

```text
2026-08-22 10:00
```

its expiration should be approximately:

```text
2026-08-23 00:00
```

using the application's configured timezone.

Do not assume UTC if the application is intended to operate using a specific configured timezone.

Make timezone configurable through environment configuration.

Recommended default:

```text
Asia/Kolkata
```

The backend must be the authority for session expiration.

The frontend must not merely assume that a session is valid because the browser still has a cookie.

---

# 19. Login Page

Create a clean, minimal login page.

Fields:

```text
Email
Password
Login button
```

Requirements:

- Clear validation errors
- Invalid credentials error
- Loading state
- No unnecessary animation
- No images
- Keyboard accessible
- Proper labels
- Proper focus handling

The page must have meaningful `data-testid` attributes.

Example:

```text
login-email
login-password
login-submit
login-error
```

---

# 20. Application Layout

After login, use a simple application shell.

Suggested layout:

```text
--------------------------------------------------
| Stock Research                         Profile |
--------------------------------------------------
| Dashboard                                      |
| Profile                                        |
|                                                |
| ADMIN                                          |
| User Management                                |
|                                                |
| Logout                                          |
--------------------------------------------------
```

Keep navigation simple.

Do not use complex animated sidebars.

Admin-only navigation items should not be shown to normal users.

However, hiding a UI item is not sufficient for authorization. Backend authorization must still be enforced.

---

# 21. Welcome Dashboard

Create an empty dashboard.

Do not implement stock functionality.

The dashboard should contain only a simple welcome message, for example:

```text
Welcome, <username>
```

Optionally include a small placeholder:

```text
Stock research features will be available here.
```

Do not create:

- Stock prices
- Charts
- Watchlists
- Market data
- News
- Financial statements
- Technical indicators
- Portfolio
- Screener
- Market widgets

These are future features.

---

# 22. Profile Page

Create a profile page for the logged-in user.

Display:

```text
Username
Email
Role
Account created date
```

Do not display:

- Password
- Password hash
- Session ID

No profile editing is required yet.

---

# 23. User Management Page

Admin-only page.

Display a simple table.

Example:

```text
Users

Username     Email              Role       Created       Actions
admin        admin@example...   Admin      ...            -
john         john@example...    User       ...            Delete
```

Add User button.

Add-user form should contain:

```text
Username
Email
Password
Create User
Cancel
```

Delete action should require confirmation.

Keep the UI simple.

No animations.

No unnecessary modal libraries if a simple accessible dialog can be implemented.

---

# 24. Frontend Routing

Use a lightweight routing solution such as React Router.

Routes:

```text
/login
/dashboard
/profile
/users
```

Behavior:

- Unauthenticated user attempting `/dashboard` → redirect to `/login`
- Unauthenticated user attempting `/profile` → redirect to `/login`
- Normal user attempting `/users` → show forbidden state or redirect appropriately
- Admin can access `/users`
- Authenticated users visiting `/login` should be redirected to `/dashboard`

The backend remains the ultimate authorization authority.

---

# 25. Authentication State

Create a small authentication state mechanism.

Do not introduce Redux or another large state-management solution unless absolutely necessary.

A lightweight React context or equivalent is sufficient.

The frontend should be able to determine:

```text
authenticated
user
role
loading
```

On application startup:

```text
GET /api/auth/me
```

If valid:

```text
authenticated
```

If session expired:

```text
clear authentication state
redirect to /login
```

---

# 26. Automatic Session Expiration Handling

If any API returns:

```text
401
```

because the session has expired:

1. Clear frontend authentication state.
2. Redirect the user to login.
3. Display an appropriate message such as:
   `Your session has expired. Please log in again.`

Do not endlessly retry failed authenticated requests.

---

# 27. Data-testid Requirement

This is mandatory.

**Every interactive or test-relevant UI element must have a meaningful `data-testid`.**

Do not use generated IDs.

Do not use generic values such as:

```text
button1
element1
test
foo
```

Use semantic names.

Examples:

```text
login-email
login-password
login-submit
login-error

navigation-dashboard
navigation-profile
navigation-users
navigation-logout

dashboard-welcome

profile-username
profile-email
profile-role
profile-created-at

users-page
users-add-button
users-table
users-row-{userId}
users-delete-{userId}

add-user-username
add-user-email
add-user-password
add-user-submit
add-user-cancel

logout-button
```

Use these `data-testid` values in Playwright.

Do not make Playwright tests dependent on:

- CSS classes
- Styling
- DOM hierarchy
- Text selectors when a meaningful test ID exists
- Automatically generated selectors

---

# 28. API Testing

Use:

- Vitest
- Axios

Create API tests for **every API endpoint implemented**.

Tests must run against the actual Fastify API/application rather than mocking the business logic.

Use an isolated test data directory.

Do not allow tests to modify production/development `data/users.json`.

Test at minimum:

## Authentication

```text
Login with valid credentials
Login with invalid email
Login with invalid password
Login with malformed input
Logout
Access protected endpoint without authentication
Access protected endpoint with expired session
Get current authenticated user
```

## Profile

```text
Authenticated user can view profile
Unauthenticated user cannot view profile
```

## Dashboard

```text
Authenticated user can access dashboard
Unauthenticated user cannot access dashboard
```

## User Management

```text
Admin can list users
Normal user cannot list users
Unauthenticated user cannot list users

Admin can create user
Normal user cannot create user
Unauthenticated user cannot create user

Admin can delete normal user
Normal user cannot delete user
Unauthenticated user cannot delete user

Admin cannot delete themselves
Admin cannot create another admin
Duplicate user/email is rejected
Invalid user data is rejected
```

## Session

Test:

```text
Valid session accepted
Expired session rejected
Logout invalidates session
Invalid session rejected
```

Tests must assert:

- HTTP status
- Response body
- Authentication behavior
- Authorization behavior
- Relevant data changes

---

# 29. Playwright End-to-End Testing

Use Playwright.

Tests must interact with the actual web application.

Do not mock APIs unless there is a specific test that genuinely requires mocking.

Use the test environment and isolated test data.

Create Playwright tests for all important UI workflows.

Minimum workflows:

## Login

```text
Open login page
Enter valid credentials
Submit
Verify dashboard is displayed
Verify username/welcome message
```

## Invalid login

```text
Open login page
Enter invalid credentials
Submit
Verify error
Verify user remains on login page
```

## Logout

```text
Login
Click logout
Verify login page
Attempt to access dashboard
Verify redirected to login
```

## Profile

```text
Login
Navigate to profile
Verify username
Verify email
Verify role
Verify created date
```

## Normal user

```text
Login as normal user
Verify dashboard
Verify profile
Verify User Management navigation is unavailable
Attempt direct /users navigation
Verify access is denied
```

## Admin

```text
Login as admin
Verify User Management navigation
Open User Management
Verify users table
```

## Add user

```text
Login as admin
Open User Management
Click Add User
Enter user information
Create user
Verify user appears in list
```

## Delete user

```text
Login as admin
Open User Management
Delete a normal user
Confirm deletion
Verify user is removed
```

## Session expiration

Create a deterministic test mechanism for simulating an expired session rather than making the test wait until midnight.

For example, allow test environment session expiration to be controlled through configuration or use an injectable clock.

Do not weaken the production session behavior merely to make testing easier.

---

# 30. Test Isolation

Tests must not depend on execution order.

Each test should have predictable data.

Use isolated test data.

For example:

```text
tests/
├── fixtures/
│   ├── users.json
│   └── sessions.json
├── api/
└── e2e/
```

The implementation should make it easy to reset test data.

---

# 31. API and UI Test Scripts

Provide convenient root-level commands.

Expected examples:

```text
pnpm install

pnpm dev

pnpm dev:web
pnpm dev:api

pnpm build

pnpm lint

pnpm typecheck

pnpm test

pnpm test:api

pnpm test:e2e

pnpm test:e2e:ui
```

Add additional scripts if useful.

The README must document every script.

---

# 32. Environment Configuration

Create:

```text
.env.example
```

Do not commit actual secrets.

Possible configuration:

```text
NODE_ENV
API_PORT
WEB_PORT
SESSION_COOKIE_NAME
SESSION_TIMEZONE
SESSION_COOKIE_SECURE
CORS_ORIGIN
DATA_DIRECTORY
TEST_DATA_DIRECTORY
```

The actual values should be appropriate for local development.

Never commit:

- Real passwords
- API keys
- Session secrets
- Production credentials

---

# 33. Initial Admin User

Provide a safe development initialization mechanism.

For example:

```text
pnpm seed
```

which creates the initial admin in the development data file.

The admin credentials should come from environment variables such as:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_USERNAME
```

Do not hardcode the password.

The seed operation should:

- Hash the password using Argon2id
- Create the admin user
- Avoid creating duplicates
- Clearly indicate what it did

---

# 34. API Documentation

Expose OpenAPI documentation.

For example:

```text
/api/docs
```

Document:

- Authentication
- Login
- Logout
- Current user
- Dashboard
- Profile
- Users
- Error responses
- Authentication requirements
- Authorization requirements

The API documentation must reflect the actual implementation.

---

# 35. Accessibility

The UI should follow basic accessibility practices:

- Semantic HTML
- Proper form labels
- Keyboard navigation
- Visible focus states
- Appropriate buttons
- Accessible form errors
- Accessible dialogs
- Appropriate heading hierarchy
- Do not rely only on color to communicate state

Playwright tests should interact with accessible UI wherever practical, while still using the mandatory `data-testid` attributes.

---

# 36. Performance Requirements

Keep the application lightweight.

Frontend:

- Avoid unnecessary dependencies.
- Avoid large component libraries.
- Avoid unnecessary images.
- Avoid unnecessary fonts.
- Avoid animations.
- Avoid large JavaScript bundles where practical.
- Lazy-load future modules when appropriate.
- Do not preload resources unnecessarily.

Backend:

- Keep request handlers lightweight.
- Avoid blocking operations where possible.
- Use asynchronous APIs.
- Avoid unnecessary computation.
- Avoid loading the entire application data model repeatedly for every request.

The architecture should be capable of supporting multiple concurrent users.

---

# 37. Logging

Implement basic structured logging in the backend.

Log useful operational information such as:

```text
Request received
Request completed
Authentication failures
Authorization failures
Unexpected errors
```

Never log:

```text
password
passwordHash
session ID
authentication cookie
```

---

# 38. Health Check

Create a health endpoint if needed for application infrastructure.

If implemented:

```text
GET /health
```

should be treated as an infrastructure endpoint rather than a business API.

Clearly document that this endpoint does not expose application data.

If the requirement that every API must be authenticated is interpreted strictly, keep `/health` outside the `/api` namespace and document its infrastructure-only purpose.

---

# 39. Project Architecture Principle

The most important architectural principle is:

> Build the initial application as a small but properly structured foundation for a much larger stock research platform.

Do NOT prematurely implement:

- Database
- Redis
- Kafka
- Microservices
- Event buses
- Complex caching
- Kubernetes
- Cloud infrastructure
- Complex state management
- AI agents
- Stock market APIs

The application should remain a simple monorepo with a clean separation of concerns.

However, do create appropriate abstraction boundaries so these can be introduced later if required.

---

# 40. Future Extensibility

The eventual application may contain features such as:

```text
Market Overview
Stock Search
Company Profiles
Financial Statements
Quarterly Results
Annual Reports
Exchange Filings
Corporate Actions
News
Technical Analysis
Fundamental Analysis
Stock Screeners
Watchlists
Research Notes
Portfolio Tracking
Alerts
AI-assisted Research
```

Do not implement any of these now.

The current implementation should simply make it easy to add them later.

---

# 41. Code Quality Rules

Use:

- TypeScript strict mode
- Strong typing
- No unnecessary `any`
- ESLint
- Prettier
- Clear naming
- Small focused functions
- Separation of concerns
- Reusable components
- Repository/service separation
- Centralized error handling
- Environment-based configuration

Avoid:

- Giant files
- Giant React components
- Business logic inside UI components
- Business logic inside route definitions
- Direct filesystem operations inside controllers
- Duplicate authentication logic
- Duplicate validation schemas
- Hardcoded credentials
- Hardcoded environment-specific URLs

---

# 42. Git-Friendly Project

Create a useful `.gitignore`.

Do not commit:

```text
node_modules
dist
.env
actual user data
session data
test runtime data
Playwright artifacts
screenshots/videos unless intentionally required
```

Provide sample data/templates where useful.

---

# 43. README

Create a comprehensive README containing:

## Project overview

Explain what the application is and that stock-market functionality is intentionally not implemented yet.

## Architecture

Explain:

```text
React/Vite frontend
        ↓
Fastify API
        ↓
Services
        ↓
Repositories
        ↓
JSON storage
```

## Monorepo structure

Explain each directory.

## Prerequisites

Specify:

- Node.js version
- pnpm version
- Other required tools

## Installation

Provide exact commands.

Example:

```text
pnpm install
```

## Environment setup

Explain `.env`.

## Initial admin setup

Explain the seed command.

## Development

Explain how to start frontend/backend.

## Testing

Explain:

```text
pnpm test:api
pnpm test:e2e
```

## API documentation

Explain where OpenAPI documentation is available.

## Architecture decisions

Explain why:

- React/Vite
- Fastify
- JSON repository
- HttpOnly session
- Argon2id
- Zod
- pnpm
- Vitest
- Axios
- Playwright

were selected.

## Future expansion

Explain how future stock-research modules can be added.

---

# 44. Acceptance Criteria

The implementation is complete only when all of the following are true.

### Application

- [ ] Monorepo works using pnpm.
- [ ] Frontend uses React + Vite + TypeScript.
- [ ] Backend uses Fastify + TypeScript.
- [ ] Shared package exists.
- [ ] Application runs locally.
- [ ] Frontend is lightweight.
- [ ] No unnecessary animations.
- [ ] No unnecessary image assets.

### Authentication

- [ ] Login works.
- [ ] Logout works.
- [ ] Passwords use Argon2id.
- [ ] Authentication uses HttpOnly cookies.
- [ ] Authentication tokens are not stored in localStorage.
- [ ] Protected APIs reject unauthenticated users.
- [ ] Sessions expire at the configured end of day.
- [ ] Expired sessions are rejected by the backend.
- [ ] Logout invalidates the session.

### Authorization

- [ ] Admin role works.
- [ ] Normal user role works.
- [ ] Normal users cannot access admin APIs.
- [ ] Normal users cannot access User Management.
- [ ] Admin cannot delete themselves.
- [ ] Admin cannot create another admin.

### Dashboard

- [ ] Authenticated users can access the dashboard.
- [ ] Dashboard is intentionally empty/minimal.
- [ ] No stock functionality exists.

### Profile

- [ ] Authenticated users can view their profile.
- [ ] Password information is never displayed.

### User Management

- [ ] Admin can list users.
- [ ] Admin can add normal users.
- [ ] Admin can delete normal users.
- [ ] Duplicate users are rejected.
- [ ] Normal users cannot perform user-management operations.

### API Testing

- [ ] Every API has Vitest coverage.
- [ ] Axios is used for API tests.
- [ ] Authentication is tested.
- [ ] Authorization is tested.
- [ ] Session expiration is tested.
- [ ] Invalid inputs are tested.
- [ ] Test data is isolated.

### Playwright

- [ ] Login workflow tested.
- [ ] Invalid login tested.
- [ ] Logout tested.
- [ ] Dashboard tested.
- [ ] Profile tested.
- [ ] Admin user-management workflow tested.
- [ ] Add-user workflow tested.
- [ ] Delete-user workflow tested.
- [ ] Normal-user restrictions tested.
- [ ] Session-expiration behavior tested.
- [ ] Playwright uses meaningful `data-testid` selectors.

### Code Quality

- [ ] TypeScript strict mode enabled.
- [ ] ESLint configured.
- [ ] Prettier configured.
- [ ] No unnecessary `any`.
- [ ] Environment variables documented.
- [ ] No secrets committed.
- [ ] README is complete.
- [ ] OpenAPI documentation works.

---

# 45. Important Implementation Constraint

Do not start implementing stock-market features just because the architecture mentions future stock functionality.

The current scope ends at:

```text
Authentication
+
Authorization
+
Dashboard
+
Profile
+
Admin User Management
+
Testing
```

Nothing beyond this scope should be implemented.

---

# 46. Development Approach

Before writing code:

1. Inspect the complete requirements.
2. Design the monorepo structure.
3. Identify shared types and validation schemas.
4. Design authentication/session flow.
5. Design repository interfaces.
6. Design API contracts.
7. Design frontend routes.
8. Design the testing architecture.

Then implement incrementally:

```text
Phase 1
Project scaffolding

Phase 2
Shared types and schemas

Phase 3
JSON repositories

Phase 4
Authentication/session system

Phase 5
Authorization

Phase 6
Dashboard/profile

Phase 7
Admin user management

Phase 8
API tests

Phase 9
Playwright E2E tests

Phase 10
Security/performance/code-quality review

Phase 11
README and final verification
```

After implementation, run:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:api
pnpm test:e2e
pnpm build
```

Fix all failures before considering the task complete.

Do not merely create placeholder tests. Tests must exercise the actual implementation and meaningful acceptance criteria.

The final result should be a clean, lightweight, secure, testable TypeScript monorepo that provides the foundation for a future stock-market research platform without implementing any stock-market functionality yet.