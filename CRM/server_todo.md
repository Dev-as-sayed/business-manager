# Server TODO: Express + TypeScript + Prisma + PostgreSQL

## Phase 0: Project setup

- [ ] `npm init`, install: `express`, `prisma`, `@prisma/client`, `zod`, `jsonwebtoken`, `bcrypt`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `rate-limit-redis` (later), `pino`, `pino-http`, `dotenv`, `http-status`
- [ ] Dev deps: `typescript`, `tsx`, `@types/*`, `eslint`, `prettier`, `vitest`, `supertest`
- [ ] `tsconfig.json` with `strict: true` and path aliases (`@/modules/*`, `@/shared/*`)
- [ ] Scripts: `dev` (tsx watch), `build`, `start`, `lint`, `test`, `db:migrate`, `db:seed`
- [ ] `.env` + `.env.example`, validated at startup with a Zod schema (`config/env.ts`). The app should crash on bad config.
- [ ] Docker Compose for local PostgreSQL

## Phase 1: Folder structure

```
server/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── src/
    ├── config/          # env.ts, constants
    ├── lib/             # prisma.ts (singleton), logger.ts
    ├── shared/
    │   ├── errors/      # ApiError.ts
    │   ├── utils/       # catchAsync.ts, sendResponse.ts, pagination.ts
    │   ├── middleware/  # globalErrorHandler, notFound, validate, auth, authorize, rateLimiters
    │   └── types/
    ├── modules/
    │   └── <module>/
    │       ├── <module>.route.ts
    │       ├── <module>.controller.ts
    │       ├── <module>.service.ts
    │       ├── <module>.validation.ts
    │       └── <module>.types.ts
    ├── routes/index.ts  # mounts all module routers under /api/v1
    ├── app.ts           # express setup, middleware, routes
    └── server.ts        # listen, graceful shutdown
```

**Rule:** route → validate → controller → service → Prisma. Controllers never touch Prisma. Services never touch `req`/`res`.

## Phase 2: Core shared layer (build before any module)

- [ ] **`ApiError`** class (`statusCode`, `message`, `errors[]`, `isOperational`)
- [ ] **`catchAsync`** wrapper so no controller needs try/catch
- [ ] **`sendResponse<T>`** with one fixed shape:
  ```json
  {
    "success": true,
    "message": "...",
    "data": {},
    "meta": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- [ ] **`globalErrorHandler`** that maps these to the same error shape:
  - `ApiError`
  - `ZodError` → 400 with per-field errors
  - Prisma `P2002` (unique) → 409
  - Prisma `P2025` (not found) → 404
  - Prisma `P2003` (foreign key) → 400
  - JWT errors → 401
  - Unknown → 500 (hide stack in production, log it)
- [ ] **`notFound`** middleware for unmatched routes
- [ ] **`validate(schema)`** middleware that parses `body`, `query`, and `params` with Zod
- [ ] **Prisma singleton** (`lib/prisma.ts`) with graceful `$disconnect`
- [ ] **Pino logger** + `pino-http` request logging with request IDs
- [ ] **Pagination/filter helper** (`parsePagination`, `buildMeta`) so list endpoints are not rewritten each time
- [ ] **Generic CRUD helpers** (optional): a small base service/controller factory for simple modules, only where it genuinely removes duplication

## Phase 3: Rate limiting

- [ ] **Global limiter**, e.g. 100 requests per 15 min per IP
- [ ] **Auth limiter**, strict: 5-10 attempts per 15 min on `/auth/login`, `/auth/register`, `/auth/forgot-password`
- [ ] **Upload limiter** for file/QC photo endpoints
- [ ] Rate-limit responses go through the same error shape (`429` via `ApiError`)
- [ ] `app.set('trust proxy', 1)` when behind NGINX, otherwise every user shares one IP
- [ ] Move to a **Redis store** when you run more than one instance (in-memory is fine for MVP)
- [ ] Key by user ID for authenticated routes, IP for public ones

## Phase 4: App hardening

- [ ] `helmet()`, `cors()` with an explicit origin allowlist (include the Electron origin), `express.json({ limit: '1mb' })`
- [ ] `compression`, `cookie-parser`
- [ ] Health endpoints: `/health` (liveness), `/health/ready` (checks DB)
- [ ] Graceful shutdown on `SIGTERM`/`SIGINT` (close server, then Prisma)
- [ ] `unhandledRejection` and `uncaughtException` handlers

## Phase 5: Database (Prisma)

- [ ] Design `schema.prisma` for the MVP: `User`, `Role`, `Permission`, `RolePermission`, `RefreshToken`, `AuditLog`, `Customer`, `Supplier`, `ProductRequest`, `Quotation`, `QuotationItem`, `PurchaseOrder`, `QcReport`, `Shipment`, `ShipmentItem` (the many-to-many join), `CustomsRecord`, `LedgerEntry`
- [ ] Use enums for statuses (`ShipmentStatus`, `QcStatus`, etc.)
- [ ] Money as `Decimal` (never `Float`) plus a `currency` column and `exchangeRate` on transactions
- [ ] Add `createdAt`, `updatedAt`, and soft delete (`deletedAt`) on business tables
- [ ] Add indexes on foreign keys and common filters (status, customerId, createdAt)
- [ ] Seed script: roles, permissions, Super Admin
- [ ] Use `prisma migrate dev` locally, `migrate deploy` in production
- [ ] Prisma `$transaction` for multi-step writes (quotation approval → PO creation, ledger entries)

## Phase 6: Auth and RBAC module

- [ ] Register/login with bcrypt hashing
- [ ] Access token (short-lived, 15 min) + refresh token (hashed in DB, rotated on use)
- [ ] Logout and logout-all (revoke refresh tokens)
- [ ] `auth` middleware (verifies JWT, attaches `req.user`)
- [ ] `authorize('purchase_orders', 'approve')` middleware (resource + action permission check)
- [ ] Data-level scoping helper (e.g. a China employee only sees assigned orders; a customer only sees their own)
- [ ] Password reset flow and change password
- [ ] Audit log middleware/service for sensitive actions

## Phase 7: Business modules (repeat the same pattern for each)

For every module: validation → service → controller → route, then register in `routes/index.ts`.

- [ ] `users` + `roles`
- [ ] `customers`
- [ ] `suppliers`
- [ ] `product-requests`
- [ ] `quotations` (fee formula in the service, approval endpoint)
- [ ] `purchase-orders`
- [ ] `quality-control` (photo upload endpoints)
- [ ] `shipments` (consolidation, status state machine)
- [ ] `customs`
- [ ] `finance` (append-only ledger, per-order profit)

Per-module checklist:

- [ ] Zod schemas for create/update/query
- [ ] Status transitions enforced in the service, not the controller
- [ ] Pagination, search, and filters on list endpoints
- [ ] Permission + scoping on every route

## Phase 8: File uploads

- [ ] `multer` (memory storage) with file type and size limits
- [ ] Storage service abstraction (`upload`, `delete`, `getSignedUrl`) so you can swap S3/Cloudinary/local
- [ ] Attachment table linked to entities (order, QC report, shipment)

## Phase 9: Quality and docs

- [ ] Unit tests for services, integration tests for routes (Supertest + test database)
- [ ] ESLint + Prettier + Husky pre-commit
- [ ] Swagger/OpenAPI (generate from Zod schemas, e.g. `zod-to-openapi`)
- [ ] Postman collection or `.http` files

## Phase 10: Deployment

- [ ] Multi-stage `Dockerfile`
- [ ] `docker-compose.prod.yml` (app + Postgres + NGINX)
- [ ] CI pipeline: lint → test → build → `prisma migrate deploy`
- [ ] Automated Postgres backups and a restore test
- [ ] Production logging and an error monitor (Sentry)

## Suggested order

**Phase 0 → 1 → 2 → 3 → 4 → 5 (auth tables only) → 6 → one simple module (customers) end to end → then the rest.** Build `customers` first as the template. Once the pattern is proven, every other module is copy-and-adapt.

Want me to generate the actual code for Phases 0-4 (setup, shared layer, error handler, response helper, rate limiters, app.ts) as a working scaffold?
