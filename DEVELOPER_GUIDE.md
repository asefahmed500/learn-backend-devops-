# Task Management API — Developer Guide

> Everything a new developer needs to understand, run, and contribute to this project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why Each Was Chosen](#2-tech-stack--why-each-was-chosen)
3. [Architecture Pattern](#3-architecture-pattern)
4. [Folder Structure Explained](#4-folder-structure-explained)
5. [Request Lifecycle (How a Request Flows)](#5-request-lifecycle-how-a-request-flows)
6. [Key Concepts Used](#6-key-concepts-used)
   - [Layered Architecture](#61-layered-architecture-routes--controllers--services--models)
   - [Centralized Error Handling](#62-centralized-error-handling)
   - [Input Validation](#63-input-validation)
   - [Async Handler Pattern](#64-async-handler-pattern)
   - [Mongoose Concepts](#65-mongoose-concepts)
   - [TypeScript Strict Mode](#66-typescript-strict-mode)
   - [Environment Configuration](#67-environment-configuration)
   - [Graceful Shutdown](#68-graceful-shutdown)
7. [DevOps & Deployment](#7-devops--deployment)
   - [Docker Multi-Stage Build](#71-docker-multi-stage-build)
   - [Docker Compose](#72-docker-compose)
   - [CI/CD Pipeline](#73-cicd-pipeline-github-actions)
8. [API Resources](#8-api-resources)
9. [Getting Started](#9-getting-started)
10. [NPM Scripts](#10-npm-scripts)
11. [Common Patterns & Conventions](#11-common-patterns--conventions)

---

## 1. Project Overview

This is a **Task Management REST API** built with Node.js. It lets you manage **Users**, **Projects**, and **Tasks** with full CRUD operations, advanced filtering, pagination, sorting, aggregation analytics, and team collaboration features.

**What it does:**
- Users can be created with roles (user, admin, manager)
- Projects group tasks together and have owners + team members
- Tasks belong to projects, can be assigned to users, have priorities, due dates, comments, and dependencies
- Each resource supports filtering, sorting, text search, and pagination
- Aggregation pipelines provide analytics (task stats, team performance, time tracking)

---

## 2. Tech Stack & Why Each Was Chosen

| Technology | What It Does | Why We Use It |
|---|---|---|
| **Node.js** | JavaScript runtime for the server | Non-blocking I/O, huge ecosystem, same language as frontend |
| **Express.js** | Web framework that handles HTTP routes | Minimal, flexible, most popular Node.js framework, huge middleware ecosystem |
| **TypeScript** | Typed superset of JavaScript | Catches bugs at compile time, better IDE support, self-documenting code, safer refactoring |
| **MongoDB** | NoSQL document database | Flexible schema, stores JSON-like documents (perfect for tasks/projects), scales horizontally |
| **Mongoose** | MongoDB ODM (Object Document Mapper) | Schema validation, middleware hooks, type safety, virtuals, population (joins), query helpers |
| **dotenv** | Loads `.env` files into `process.env` | Keeps secrets out of code, different configs per environment |
| **bcryptjs** | Password hashing library | Industry standard for securely hashing passwords before storing them |
| **jsonwebtoken** | JWT token creation/verification | Stateless authentication — no server-side session storage needed |
| **express-validator** | Request validation middleware | Declarative validation chains, sanitization, clear error messages |
| **cors** | Cross-Origin Resource Sharing middleware | Allows frontend apps on different domains to call this API |
| **nodemon** | Auto-restarts server on file changes | Faster development — no manual restart after every code change |
| **ts-node** | Runs TypeScript directly without pre-compiling | Used by nodemon to run `.ts` files during development |
| **rimraf** | Cross-platform `rm -rf` | Cleans the `dist/` folder before each build (works on Windows + Linux) |
| **Docker** | Containerization platform | Consistent environment everywhere, easy deployment, no "works on my machine" issues |
| **GitHub Actions** | CI/CD automation | Automatically builds, lints, and tests on every push |

---

## 3. Architecture Pattern

This project uses a **Layered (N-Tier) Architecture**, which is the industry standard for enterprise backend APIs:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser / Postman)        │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────┐
│  MIDDLEWARE LAYER                                    │
│  cors → json parser → request logger                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  ROUTES LAYER          (src/routes/)                │
│  Defines URL patterns + attaches validators         │
│  e.g., POST /api/users → [validators] → controller  │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  VALIDATION LAYER      (src/validators/)            │
│  express-validator chains check & sanitize input    │
│  Bad input? → 422 response, request stops here      │
└─────────────────────┬───────────────────────────────┘
                      │ Input is valid
                      ▼
┌─────────────────────────────────────────────────────┐
│  CONTROLLER LAYER      (src/controllers/)           │
│  Thin HTTP adapter — extracts req data, calls       │
│  service, formats HTTP response                     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  SERVICE LAYER         (src/services/)              │
│  ALL business logic lives here                      │
│  Talks to models, throws AppErrors                  │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  MODEL LAYER           (src/models/)                │
│  Mongoose schemas, middleware, methods, statics     │
│  Talks directly to MongoDB                          │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                    MongoDB Database                  │
└─────────────────────────────────────────────────────┘
```

**Why this pattern?**
- **Separation of Concerns** — each layer has one job
- **Testability** — services can be unit tested without HTTP
- **Reusability** — services can be called from CLI scripts, cron jobs, not just HTTP
- **Maintainability** — changes in one layer don't break others

---

## 4. Folder Structure Explained

```
e:\learn\
│
├── src/                          # All source code lives here
│   ├── config/                   # Configuration & environment
│   │   ├── index.ts              # Reads .env, exports typed config object
│   │   └── database.ts           # MongoDB connection + disconnect logic
│   │
│   ├── constants/                # App-wide constants & enums
│   │   └── index.ts              # HttpStatus, UserRole, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority
│   │
│   ├── types/                    # TypeScript interfaces & types
│   │   └── index.ts              # IUser, ITask, IProject, IComment, ApiResponse, PaginatedResult
│   │
│   ├── utils/                    # Shared utility functions
│   │   ├── AppError.ts           # Custom error classes (NotFoundError, BadRequestError, etc.)
│   │   └── response.ts           # Standardized response helpers (sendSuccess, sendCreated, sendError)
│   │
│   ├── middleware/               # Express middleware functions
│   │   ├── index.ts              # Barrel export (re-exports all middleware)
│   │   ├── asyncHandler.ts       # Wraps async controllers to catch errors automatically
│   │   ├── errorHandler.ts       # Global error handler (catches ALL errors, sends proper response)
│   │   ├── requestLogger.ts      # Logs every incoming request (method + path + timestamp)
│   │   ├── validate.ts           # Checks express-validator results, returns 422 if invalid
│   │   └── notFoundHandler.ts    # Catches requests to undefined routes → 404
│   │
│   ├── validators/               # Input validation rules (express-validator chains)
│   │   ├── index.ts              # Barrel export
│   │   ├── user.validator.ts     # createUserRules, updateUserRules, listUsersRules, etc.
│   │   ├── task.validator.ts     # createTaskRules, updateTaskRules, addCommentRules, etc.
│   │   └── project.validator.ts  # createProjectRules, updateProjectRules, etc.
│   │
│   ├── models/                   # Mongoose schemas & models
│   │   ├── index.ts              # Barrel export (User, Task, Project)
│   │   ├── User.ts               # User schema: password hashing, virtuals, statics, instance methods
│   │   ├── Task.ts               # Task schema: subdocuments (comments), indexes, pre-save hooks
│   │   └── Project.ts            # Project schema: virtual populate, auto-add owner to members
│   │
│   ├── services/                 # Business logic layer
│   │   ├── index.ts              # Barrel export
│   │   ├── user.service.ts       # UserService: create, list, getById, update, delete, getActiveUsers
│   │   ├── task.service.ts       # TaskService: CRUD + complete, addComment, statistics, overdue, bulk
│   │   └── project.service.ts    # ProjectService: CRUD + addMember, removeMember, analytics
│   │
│   ├── controllers/              # Thin HTTP handlers
│   │   ├── index.ts              # Barrel export
│   │   ├── user.controller.ts    # Extracts req data → calls userService → sends response
│   │   ├── task.controller.ts    # Extracts req data → calls taskService → sends response
│   │   └── project.controller.ts # Extracts req data → calls projectService → sends response
│   │
│   ├── routes/                   # Route definitions
│   │   ├── index.ts              # Combines all route modules under /api
│   │   ├── user.routes.ts        # /api/users/* routes + validation middleware
│   │   ├── task.routes.ts        # /api/tasks/* routes + validation middleware
│   │   └── project.routes.ts     # /api/projects/* routes + validation middleware
│   │
│   ├── app.ts                    # Express app setup: middleware → routes → error handlers
│   └── server.ts                 # Entry point: connects DB → starts server → graceful shutdown
│
├── dist/                         # Compiled JavaScript output (auto-generated by `tsc`)
│
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD pipeline
│
├── .env.example                  # Template for environment variables
├── .env                          # Actual env vars (NOT committed to git)
├── .gitignore                    # Files/folders excluded from git
├── .dockerignore                 # Files excluded from Docker build context
├── Dockerfile                    # Multi-stage Docker build (builder → production)
├── docker-compose.yml            # MongoDB + API containers orchestration
├── package.json                  # Dependencies, scripts, project metadata
├── tsconfig.json                 # TypeScript compiler configuration
├── api-examples.http             # API test requests (for VS Code REST Client extension)
└── README.md                     # Project readme
```

### Why each folder exists:

| Folder | Purpose | Without it... |
|---|---|---|
| `config/` | Single source of truth for all settings | Config values scattered everywhere, hard to change |
| `constants/` | Enums prevent typos like `'admim'` | Magic strings everywhere, bugs from typos |
| `types/` | TypeScript interfaces shared across layers | Duplicate type definitions, inconsistency |
| `utils/` | Reusable helpers (errors, response formatting) | Same try-catch and response code repeated in every controller |
| `middleware/` | Cross-cutting concerns (logging, errors, validation) | Duplicate logic in every route handler |
| `validators/` | Input validation rules separated from routes | Validation mixed into controllers, hard to maintain |
| `models/` | Database schema definitions | No data structure enforcement |
| `services/` | Business logic separated from HTTP | Controllers become 200+ line monsters, untestable |
| `controllers/` | Thin HTTP-to-service adapters | Business logic coupled to Express, can't reuse from CLI/workers |
| `routes/` | URL → handler mapping | Route definitions mixed with business logic |

---

## 5. Request Lifecycle (How a Request Flows)

Here's exactly what happens when a client sends `POST /api/users` with a JSON body:

```
1. Express receives the HTTP request

2. GLOBAL MIDDLEWARE runs (defined in app.ts):
   ├── cors()              → Adds CORS headers
   ├── express.json()      → Parses JSON body into req.body
   ├── express.urlencoded() → Parses form data
   └── requestLogger       → Logs: "[2026-02-14T...] POST /api/users"

3. ROUTE MATCHING (routes/user.routes.ts):
   └── router.post('/', createUserRules, validate, createUser)
       This matches POST /api/users

4. VALIDATION MIDDLEWARE runs:
   ├── createUserRules     → express-validator checks:
   │                          - username: required, 3-30 chars, lowercase+numbers+underscores
   │                          - email: required, valid email format
   │                          - password: required, min 6 chars
   │                          - fullName: required, max 100 chars
   │                          - role: optional, must be user|admin|manager
   │
   └── validate            → Checks validation results.
                              If errors exist → returns 422 with error details. STOPS HERE.
                              If valid → calls next()

5. CONTROLLER (controllers/user.controller.ts):
   └── createUser handler:
       - Wrapped by asyncHandler (catches any thrown error)
       - Calls userService.create(req.body)
       - Sends 201 response with sendCreated()

6. SERVICE (services/user.service.ts):
   └── UserService.create():
       - Checks if user already exists (by email or username)
       - If duplicate → throws ConflictError (409)
       - Calls User.create() (Mongoose model)
       - Returns user.getPublicProfile()

7. MODEL (models/User.ts):
   └── User.create() triggers Mongoose pipeline:
       ├── Schema validation  → Checks required fields, types, enums
       ├── Pre-save hook      → Hashes password with bcrypt
       ├── MongoDB insert     → Saves document to database
       └── Post-save hook     → Logs "User saved: ..."

8. RESPONSE sent back to client:
   {
     "success": true,
     "message": "User created successfully",
     "data": { "id": "...", "username": "...", "email": "...", ... }
   }

9. IF AN ERROR OCCURS at any step:
   ├── asyncHandler catches it → passes to next(error)
   └── errorHandler middleware handles it:
       ├── AppError (our custom errors)    → Returns proper status + message
       ├── Mongoose ValidationError        → Returns 400 with field errors
       ├── Mongoose CastError (bad ID)     → Returns 400 "Invalid id"
       ├── MongoDB duplicate key (11000)   → Returns 409 "Duplicate value"
       └── Unknown error                   → Returns 500 "Internal server error"
```

---

## 6. Key Concepts Used

### 6.1 Layered Architecture (Routes → Controllers → Services → Models)

**What:** Each layer has a single responsibility and only talks to the layer below it.

**Why:**
- Controllers don't know about MongoDB queries
- Services don't know about HTTP status codes
- Models don't know about business rules
- You can swap MongoDB for PostgreSQL by only changing the service + model layers

**Example flow:**
```typescript
// ROUTE — just wiring
router.post('/', createUserRules, validate, createUser);

// CONTROLLER — thin HTTP adapter
export const createUser = asyncHandler(async (req, res) => {
  const profile = await userService.create(req.body);  // delegates to service
  sendCreated(res, profile, 'User created');            // formats HTTP response
});

// SERVICE — all business logic
async create(dto) {
  const existing = await User.findOne({ email: dto.email });  // uses model
  if (existing) throw new ConflictError('Already exists');     // throws domain error
  const user = await User.create(dto);                         // uses model
  return user.getPublicProfile();                              // returns data
}
```

---

### 6.2 Centralized Error Handling

**What:** All errors flow to ONE place: the `errorHandler` middleware in `src/middleware/errorHandler.ts`.

**Why:**
- No `try/catch` blocks in controllers (they're ugly and repetitive)
- Consistent error response format across the entire API
- Different error types get different HTTP status codes automatically
- Development mode shows stack traces; production hides them

**How it works:**
```
throw new NotFoundError('User')
  → asyncHandler catches it
    → passes to Express error middleware
      → errorHandler checks: "Is it an AppError? A Mongoose error? Unknown?"
        → Sends the right HTTP status + clean JSON response
```

**Custom error hierarchy:**
```
AppError (base)
├── NotFoundError     → 404
├── BadRequestError   → 400
├── UnauthorizedError → 401
├── ForbiddenError    → 403
└── ConflictError     → 409
```

---

### 6.3 Input Validation

**What:** Every route has validation rules that run BEFORE the controller.

**Why:**
- Never trust user input
- Catches bad data early (before it reaches the database)
- Returns clear, field-specific error messages
- Prevents injection attacks and invalid data types

**How:**
```typescript
// validators/user.validator.ts — defines RULES
export const createUserRules = [
  body('email').trim().notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
];

// routes/user.routes.ts — attaches rules + validate middleware
router.post('/', createUserRules, validate, createUser);

// middleware/validate.ts — checks results
if (errors exist) → respond 422 with errors
else → next()
```

---

### 6.4 Async Handler Pattern

**What:** A wrapper function that catches errors from async controller functions.

**Why:** Without it, every controller needs an ugly try/catch:
```typescript
// ❌ WITHOUT asyncHandler (repetitive)
export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);  // must manually forward to error middleware
  }
};

// ✅ WITH asyncHandler (clean)
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json(user);
  // errors are caught automatically!
});
```

---

### 6.5 Mongoose Concepts

This project demonstrates many Mongoose features:

| Concept | Where Used | What It Does |
|---|---|---|
| **Schema** | All models | Defines document structure, field types, validation rules |
| **Middleware (Hooks)** | `User.ts` pre-save | Hashes password automatically before saving |
| **Instance Methods** | `User.ts` `.comparePassword()`, `Task.ts` `.markAsComplete()` | Methods on individual documents |
| **Static Methods** | `User.ts` `findByEmail()`, `findActiveUsers()` | Methods on the model itself (like class methods) |
| **Virtuals** | `User.ts` `profileUrl`, `Task.ts` `isOverdue` | Computed properties that aren't stored in DB |
| **Virtual Populate** | `User.ts` `tasks`, `Project.ts` `tasks` | Populate referenced docs without storing IDs in the parent |
| **Subdocuments** | `Task.ts` `comments[]` | Embedded documents (comments stored inside the task document) |
| **Indexes** | All models | Speed up queries on frequently-searched fields |
| **Text Index** | `Task.ts`, `Project.ts` | Enables `$text` full-text search |
| **Population** | Services (`.populate()`) | "Joins" — replaces ObjectId references with actual document data |
| **Aggregation** | `TaskService.getStatistics()`, `ProjectService.getAnalytics()` | Complex data analysis pipelines (grouping, counting, lookups) |

---

### 6.6 TypeScript Strict Mode

**What:** `"strict": true` in `tsconfig.json` enables the strictest type checking.

**Why:**
- `strictNullChecks` — forces you to handle `null` / `undefined`
- `noImplicitAny` — no accidental `any` types
- `strictFunctionTypes` — catches callback type mismatches
- Catches entire categories of bugs at compile time instead of runtime

---

### 6.7 Environment Configuration

**What:** All settings come from environment variables, loaded via `dotenv`, and centralized in `src/config/index.ts`.

**Why:**
- Secrets (DB connection string, JWT secret) never hardcoded in source code
- Different values for development / staging / production
- The config object is typed with `as const` — TypeScript knows exact types
- One place to see every configurable setting

**Files involved:**
```
.env.example    → Template (committed to git, no secrets)
.env            → Actual values (NOT committed to git)
src/config/     → Reads .env and exports typed config object
```

---

### 6.8 Graceful Shutdown

**What:** When the server receives SIGTERM or SIGINT (e.g., Ctrl+C, Docker stop), it:
1. Stops accepting new connections
2. Finishes in-flight requests
3. Closes MongoDB connection
4. Exits cleanly

**Why:**
- Prevents data corruption from abrupt shutdowns
- Docker/Kubernetes send SIGTERM before killing containers
- In-progress database writes complete safely

**Code location:** `src/server.ts`

---

## 7. DevOps & Deployment

### 7.1 Docker Multi-Stage Build

**File:** `Dockerfile`

```
Stage 1 (builder):              Stage 2 (production):
┌─────────────────────┐        ┌─────────────────────┐
│ Full Node.js image   │        │ Alpine Node.js image │
│ Install ALL deps     │───────▶│ Install PROD deps only│
│ Compile TypeScript   │  copy  │ Copy compiled JS     │
│ Output: dist/ folder │  dist  │ Run as non-root user │
└─────────────────────┘        └─────────────────────┘
                                Final image: ~150MB
                                (vs ~1GB with everything)
```

**Why multi-stage?**
- Final image doesn't have TypeScript, devDependencies, or source code
- Smaller image = faster deploys, less attack surface
- Non-root user = security best practice
- Built-in healthcheck = orchestrators know if the app is alive

---

### 7.2 Docker Compose

**File:** `docker-compose.yml`

Starts the entire stack with one command: `docker compose up`

```
┌──────────────────────┐      ┌───────────────────────┐
│   api container       │─────▶│   mongo container      │
│   Port 5000           │      │   Port 27017           │
│   Node.js app         │      │   MongoDB 7            │
│   Env: MONGODB_URI    │      │   Volume: mongo-data   │
└──────────────────────┘      └───────────────────────┘
         │                              │
         └──────── app-network ─────────┘
                  (bridge network)
```

**Key features:**
- `depends_on` ensures MongoDB starts before the API
- Named volume `mongo-data` persists data across container restarts
- Bridge network so containers find each other by service name (`mongo`)
- Environment variables passed to the API container

---

### 7.3 CI/CD Pipeline (GitHub Actions)

**File:** `.github/workflows/ci.yml`

Triggers on every push to `main`/`develop` and on pull requests:

```
Push/PR → GitHub Actions
           │
           ▼
    ┌──────────────┐
    │  BUILD JOB   │
    │  npm ci       │
    │  tsc (build)  │
    │  lint         │
    │  Upload dist/ │
    └──────┬───────┘
           │ (on main only)
           ▼
    ┌──────────────┐
    │  DOCKER JOB  │
    │  Build image  │
    │  Start + test │
    │  health check │
    └──────────────┘
```

**Why CI/CD?**
- Every commit is automatically verified — no broken code in main
- TypeScript errors caught before merging
- Docker image is validated to start and respond to health checks
- Consistent builds — not dependent on any developer's machine

---

## 8. API Resources

### Users (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | List users (filter, sort, paginate) |
| GET | `/api/users/:id` | Get user by ID with task stats |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/active/list` | Get all active users |
| GET | `/api/users/role/:role` | Get users by role |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | List tasks (filter, sort, paginate) |
| GET | `/api/tasks/:id` | Get task by ID (fully populated) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/complete` | Mark task as complete |
| POST | `/api/tasks/:id/comments` | Add a comment |
| GET | `/api/tasks/analytics/statistics` | Aggregated task statistics |
| GET | `/api/tasks/status/overdue` | Get overdue tasks |
| PATCH | `/api/tasks/bulk/update` | Bulk update multiple tasks |

### Projects (`/api/projects`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects` | List projects (filter, sort, paginate) |
| GET | `/api/projects/:id` | Get project by ID with tasks |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + its tasks |
| POST | `/api/projects/:id/members` | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/projects/:id/analytics` | Project analytics dashboard |

---

## 9. Getting Started

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** running locally, OR **Docker** installed

### Option A: Run locally

```bash
# 1. Clone the repo
git clone <repo-url> && cd task-management-api

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env with your MongoDB URI if needed

# 4. Start in development mode (auto-reload)
npm run dev
```

### Option B: Run with Docker (recommended)

```bash
# Starts MongoDB + API with one command
npm run docker:up

# Stop everything
npm run docker:down
```

### Verify it works

```bash
# Health check
curl http://localhost:5000/health

# Create a user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"pass123","fullName":"John Doe"}'
```

---

## 10. NPM Scripts

| Script | Command | What It Does |
|---|---|---|
| `npm run dev` | `nodemon src/server.ts` | Start dev server with auto-reload |
| `npm run build` | `tsc` | Compile TypeScript to JavaScript in `dist/` |
| `npm start` | `node dist/server.js` | Run compiled production code |
| `npm run clean` | `rimraf dist` | Delete the `dist/` folder |
| `npm run docker:up` | `docker compose up -d --build` | Build & start all Docker containers |
| `npm run docker:down` | `docker compose down -v` | Stop & remove containers + volumes |

---

## 11. Common Patterns & Conventions

### File Naming
- Models: `PascalCase.ts` → `User.ts`, `Task.ts`
- Everything else: `kebab-case.ts` → `user.controller.ts`, `task.service.ts`
- Barrel exports: every folder has an `index.ts` that re-exports everything

### Barrel Exports (`index.ts`)
Every folder has an `index.ts` that re-exports its contents. This lets you import from the folder:
```typescript
// ✅ Clean import from folder
import { User, Task, Project } from '../models';

// ❌ Instead of importing from individual files
import { User } from '../models/User';
import { Task } from '../models/Task';
```

### Response Format
Every API response follows the same shape:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "User not found"
}
```

### Error Handling Rules
1. **Services** throw `AppError` subclasses (e.g., `throw new NotFoundError('User')`)
2. **Controllers** never use try/catch — `asyncHandler` catches everything
3. **errorHandler** middleware translates errors to HTTP responses
4. Mongoose validation errors are automatically formatted

### Adding a New Resource (e.g., "Comments")

1. Create the interface in `src/types/index.ts`
2. Create the schema in `src/models/Comment.ts`
3. Create validation rules in `src/validators/comment.validator.ts`
4. Create the service in `src/services/comment.service.ts`
5. Create the controller in `src/controllers/comment.controller.ts`
6. Create routes in `src/routes/comment.routes.ts`
7. Register routes in `src/routes/index.ts`
8. Export from barrel files (`index.ts` in each folder)

---

*Last updated: February 2026*
