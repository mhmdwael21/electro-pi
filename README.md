# Project & Task Management API

A REST API for managing projects and tasks. Users register, log in with JWT, and manage their own projects. Each project has tasks that can be filtered by status and priority.

Built as a technical assessment for Electro Pi.

## Tech Stack

| Category | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| Auth | JWT (`jsonwebtoken`) |
| Password hashing | bcrypt |
| Validation | Zod |
| API docs | Swagger UI (OpenAPI 3.0) |
| Security | helmet, cors |

## Project Structure

```
src/
├── config/          Env validation and TypeORM data source
├── entities/        User, Project, Task
├── middlewares/     Auth, validation, error handling
├── migrations/      TypeORM migrations
├── modules/
│   ├── auth/        routes → controller → service → validation
│   ├── projects/
│   └── tasks/
├── seeds/           Sample data script
├── utils/           AppError, password hashing, JWT helpers
├── docs/            OpenAPI spec
├── app.ts           Express app setup
└── server.ts        DB connection and server start
```

Requests flow through **routes → middleware → controller → service → entity**.

Routes declare the URL and attach auth and validation middleware. Controllers only deal with HTTP: they read the request, call a service, and send the response. They contain no database access and no business rules. Services hold the business logic. They take plain arguments, return plain data, and throw `AppError` when something is wrong. They never touch `req` or `res`, which is why the seed script can call them directly.

`app.ts` builds and exports the Express app. `server.ts` connects to the database and starts listening. They are split so tests can import the app without opening a port.

## Getting Started

### Requirements

- Node.js 18 or higher
- PostgreSQL 14 or higher

### 1. Clone and install

```bash
git clone https://github.com/mhmdwael21/electro-pi.git
cd electro-pi
npm install
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE electro_pi;"
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in your Postgres credentials. For the JWT secret, generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Seed sample data (optional)

```bash
npm run seed
```

### 6. Start the server

```bash
npm run dev
```

The API runs at `http://localhost:3000/api/v1`.

## Environment Variables

```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_EXPIRES_IN=1d
```

All database variables and `JWT_SECRET` are required. If one is missing, the app exits at startup and prints which key is missing, instead of failing later during a request.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run seed` | Fill the database with sample data |
| `npm run migration:generate -- src/migrations/Name` | Generate a migration from entity changes |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Roll back the last migration |

## API Documentation

Swagger UI is available at:

**`http://localhost:3000/api-docs`**

To try the protected endpoints: call `/auth/login`, copy the token from the response, click **Authorize** at the top of the page, and paste it.

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Register a new user |
| POST | `/api/v1/auth/login` | — | Log in and get a JWT |
| GET | `/api/v1/projects` | ✓ | List your projects |
| POST | `/api/v1/projects` | ✓ | Create a project |
| GET | `/api/v1/projects/:id` | ✓ | Get one project |
| PATCH | `/api/v1/projects/:id` | ✓ | Update a project |
| DELETE | `/api/v1/projects/:id` | ✓ | Delete a project and its tasks |
| GET | `/api/v1/projects/:projectId/tasks` | ✓ | List tasks (filterable) |
| POST | `/api/v1/projects/:projectId/tasks` | ✓ | Create a task |
| GET | `/api/v1/projects/:projectId/tasks/:id` | ✓ | Get one task |
| PATCH | `/api/v1/projects/:projectId/tasks/:id` | ✓ | Update a task |
| DELETE | `/api/v1/projects/:projectId/tasks/:id` | ✓ | Delete a task |

Tasks can be filtered by status, priority, or both:

```
GET /api/v1/projects/:projectId/tasks?status=in_progress&priority=high
```

Invalid filter values return 400 instead of an empty list.

### Seeded accounts

After running `npm run seed`:

| Email | Password | Data |
|---|---|---|
| `alice@example.com` | `password123` | 2 projects, 4 tasks |
| `bob@example.com` | `password123` | 1 project |

There are two users on purpose, so ownership can be tested. Logging in as Bob and requesting one of Alice's projects returns 404.

## Response Format

All responses use the same shape.

Success:

```json
{
  "status": "success",
  "data": { }
}
```

List endpoints also return a `results` count.

Error:

```json
{
  "status": "error",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

`details` only appears on validation errors. It lists every invalid field at once, so the client does not have to fix them one request at a time.

### Status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | Deleted, no content |
| 400 | Validation failed (body, params, or query) |
| 401 | Missing, invalid, or expired token; wrong credentials |
| 404 | Not found, or not owned by the current user |
| 409 | Email already registered |
| 500 | Unexpected server error |

## Implementation Notes

**Ownership scoping.** Every project query includes the current user's ID in the `WHERE` clause. I did not fetch the row first and check the owner afterwards, because that leaves a code path where the check can be forgotten. A project that belongs to someone else is simply not found.

Tasks do not have a `userId`. Ownership comes from the parent project. So every task operation first calls the project service's scoped lookup, and then also checks that the task belongs to that project. Both checks are needed: owning a project does not mean owning a task ID someone else passed in.

**404 instead of 403.** Returning 403 would confirm that the resource exists. Returning 404 means another user's project looks exactly the same as one that was never created, so nothing leaks about other users' data.

**Login errors are identical.** A wrong email and a wrong password both return 401 with the same message. If they were different, someone could use the endpoint to find out which emails are registered.

**Passwords.** Hashed with bcrypt at cost factor 10. The column is declared `select: false`, so it is left out of every query by default and cannot end up in a response by accident. Login opts back in with the query builder, which is the only place the hash is loaded. Passwords are capped at 72 bytes because bcrypt silently ignores anything past that.

**Mass assignment.** Zod strips unknown keys during validation, and controllers destructure only the fields they need. `userId` and `projectId` are always taken from the session or the URL, never from the request body.

**Migrations instead of synchronize.** `synchronize` is off. Every schema change is a generated migration committed with the code, so the schema is versioned and reversible.

**Timestamps.** `dueDate` and the audit columns use `timestamptz`, so times are stored as absolute instants in UTC rather than ambiguous local times.

**Error handling.** Services throw `AppError` with a status code, and one error middleware formats every error response. Express 5 forwards rejected promises to the error handler on its own, so there is no async wrapper and no try/catch in the controllers. Errors that are not `AppError` are logged on the server and returned as a generic 500, so internal details never reach the client.

**Data model.** A project has one owner (`ManyToOne` to User), which matches the requirement "get all projects for the authenticated user". A collaborative version would add a `project_members` join table next to the existing owner foreign key rather than replacing it, since "who owns this" and "who can work on this" are two different questions.

**Cascade deletes.** Deleting a project deletes its tasks. Deleting a user deletes their projects, and through them their tasks.

## Known Simplifications

These were left out on purpose for the scope of the assessment:

- **No refresh tokens.** One access token with a configurable expiry. A real system would use a short access token plus a refresh token.
- **No token revocation.** JWTs stay valid until they expire. The auth middleware does check that the user still exists on every request, so deleted accounts are rejected right away.
- **CORS is open.** Production would restrict it to known origins.
- **No rate limiting** on the auth endpoints.
- **No pagination** on list endpoints.

## Author

**Mohamed Wael**
mohamedwael2128@gmail.com
[github.com/mhmdwael21](https://github.com/mhmdwael21)
