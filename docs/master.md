# Backend Master Documentation

## 1) Project Stack

- Runtime: Node.js + TypeScript
- Framework: Express
- Database: MySQL
- ORM: Drizzle ORM with `mysql2/promise`
- Validation: Zod
- Auth Model: Access JWT + refresh session rotation

## 2) Backend Startup and Request Lifecycle

### Startup flow

1. `src/server.ts` loads env and bootstraps app.
2. `verifyDatabaseConnection()` from `src/db/index.ts` is executed first.
3. If DB ping succeeds, server listens on port `5000`.
4. If startup fails, error is logged and process exits with code `1`.

### App middleware chain (`src/app.ts`)

1. CORS (`origin: env.FRONTEND_URL`, `credentials: true`)
2. `express.json()`
3. `cookieParser()`
4. Route registration via `src/app/routes/index.ts`

### Route map

- `/auth` mounted from `src/app/routes/auth.routes.ts`
  - `POST /auth/register` -> `validate(registerSchema)` -> `authController.register`
  - `POST /auth/login` -> `validate(loginSchema)` -> `authController.login`
  - `POST /auth/refresh` -> `authController.refresh`
  - `POST /auth/logout` -> `authController.logout`
  - `GET /auth/me` -> `authenticate` -> `authController.me`
- `/ui` mounted from `src/app/routes/ui.routes.ts`
  - `GET /ui/get-role-list` -> `uiController.getRoleList`

## 3) Layered Logic Details

### Controller layer (`src/app/controllers/auth.controller.ts`)

- Receives HTTP request/cookies.
- Calls auth service methods.
- Sets auth cookies:
  - `accessToken`
  - `refreshToken`
- Returns user payload response.
- Uses `catchAsync` for async error forwarding.

Cookie behavior currently:

- `httpOnly: true`
- `secure: false`
- `sameSite: "lax"`

### Service layer (`src/app/services/auth.service.ts`)

Main functions:

- `register(input)`
  - Checks for existing user by email.
  - Hashes password with bcrypt (`SALT_ROUNDS = 10`).
  - Creates user row.
  - Creates refresh session and access token.
- `login(input)`
  - Fetches user by email.
  - Validates password hash.
  - Creates refresh session and access token.
- `refreshWithToken(refreshToken)`
  - Hashes incoming refresh token.
  - Finds active (non-expired) refresh session by hash.
  - Loads linked user.
  - Rotates refresh session hash + expiry.
  - Returns new access token + refresh token.
- `logoutWithRefreshToken(refreshToken)`
  - Hashes incoming refresh token.
  - Deletes matching refresh session.
  - Controller clears auth cookies.

## 4) Authentication and Token Logic

### Access token

- Generated in `src/utils/jwt.ts`.
- Signed with `env.JWT_SECRET`.
- Expiry from `env.JWT_ACCESS_EXPIRES_IN` (mapped from `JWT_EXPIRES_IN` env).
- Payload shape:
  - `userId`
  - `email`

### Refresh token

- Built in `src/utils/refreshToken.ts` as JWT with:
  - `tokenType: "refresh"`
  - `nonce` UUID
- Plain token is returned to client.
- DB stores only `sha256` hash (`token_hash`) for security.
- Expiry extracted from token `exp` and stored in DB.
- Rotation updates `token_hash` and `expires_at` every successful refresh.

### Auth middleware (`src/middleware/authenticate.ts`)

- Accepts token from:
  - `Authorization: Bearer <token>`
  - OR `accessToken` cookie
- Verifies JWT and attaches payload to `req.auth`.
- Returns `401` for:
  - missing token
  - expired token
  - invalid token

## 5) Validation and Error Handling

### Validation (`src/middleware/validate.ts`)

- Supports schema validation for `params`, `query`, `body`.
- Uses Zod parsers and normalizes errors into:
  - `field`
  - `message`
- Returns `400` with structured `errors` array on failure.

### Schemas (`src/validations/auth.validation.ts`)

- `registerSchema`
  - `name`: required non-empty string
  - `email`: valid email
  - `password`: min length 8
  - `role`: non-empty value constrained to `ASSIGNABLE_ROLES`
- `loginSchema`
  - picks `email` and `password` from register schema

### Error utilities

- `src/utils/catchAsync.ts`: wraps async handlers and forwards to `next`.
- `src/utils/appError.ts`: app-level operational error class with status codes.

## 6) Database Connection Details

Implemented in `src/db/index.ts`:

1. Checks `DATABASE_URL` exists.
2. Creates pool:
   - `mysql.createPool({ uri: process.env.DATABASE_URL })`
3. Creates Drizzle client:
   - `drizzle({ client: pool, schema, mode: "default" })`
4. Exposes:
   - `pool` (MySQL connection pool)
   - `db` (Drizzle instance)
   - `verifyDatabaseConnection()` (ping health check)

## 7) Drizzle Configuration and Migration Workflow

`drizzle.config.ts`:

- `dialect: "mysql"`
- `schema: "./src/db/schema"`
- `out: "./drizzle"`
- `dbCredentials.url = process.env.DATABASE_URL`

Available scripts (`backend/package.json`):

- `npm run db:generate` -> generate migrations from schema
- `npm run db:migrate` -> apply migrations
- `npm run db:push` -> directly sync schema (without migration files)
- `npm run db:studio` -> open Drizzle Studio

Recommended production-safe flow:

1. Edit schema files under `src/db/schema`.
2. Run `npm run db:generate`.
3. Review generated SQL in `drizzle/`.
4. Run `npm run db:migrate`.
5. Verify in MySQL Workbench.

## 8) Environment Variables

Required by backend logic:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN` (interpreted as days by `env.ts`)
- `FRONTEND_URL`

## 9) Table Definitions and Relationships

Schema exports are centralized in `src/db/schema/index.ts`.

### `users` (`src/db/schema/user.ts`)

Columns:

- `id` `varchar(255)` PRIMARY KEY
- `name` `varchar(255)` NOT NULL
- `email` `varchar(255)` NOT NULL UNIQUE
- `password` `varchar(255)` NOT NULL
- `role_key` `varchar(255)` NOT NULL (FK -> `roles.key`)
- `created_at` `timestamp` NOT NULL DEFAULT now
- `updated_at` `timestamp` NOT NULL DEFAULT now ON UPDATE now

Purpose:

- Stores user identity and credentials.
- Stores role assignment used for RBAC authorization.

### `refresh_sessions` (`src/db/schema/refresh_session.ts`)

Columns:

- `id` `varchar(36)` PRIMARY KEY
- `user_id` `varchar(255)` NOT NULL
- `token_hash` `varchar(64)` NOT NULL UNIQUE
- `expires_at` `timestamp` NOT NULL
- `created_at` `timestamp` NOT NULL DEFAULT now

Constraints/indexes:

- FK: `user_id` -> `users.id` (`ON DELETE CASCADE`)
- Unique: `token_hash`
- Index: `refresh_sessions_user_id_idx` on `user_id`

Purpose:

- Stores hashed refresh token sessions and expiration data.

### `roles` (`src/db/schema/rbac.ts`)

Columns:

- `key` `varchar(255)` PRIMARY KEY
- `display_name` `varchar(255)` NOT NULL

Purpose:

- Stores RBAC role definitions.

### `permissions` (`src/db/schema/rbac.ts`)

Columns:

- `key` `varchar(255)` PRIMARY KEY
- `display_name` `varchar(255)` NOT NULL

Purpose:

- Stores RBAC permission definitions.

### `role_permissions` (`src/db/schema/rbac.ts`)

Columns:

- `role_key` `varchar(255)` NOT NULL
- `permission_key` `varchar(255)` NOT NULL

Constraints:

- FK: `role_key` -> `roles.key` (`ON DELETE CASCADE`)
- FK: `permission_key` -> `permissions.key` (`ON DELETE CASCADE`)
- Composite primary key: (`role_key`, `permission_key`)

Purpose:

- Join table for many-to-many role-permission mapping.

Composite key note:

- No extra `pk` data column exists.
- Primary key is a DB constraint/index over (`role_key`, `permission_key`).
- Duplicate pairs are rejected by MySQL automatically.

### `store_room` (`src/db/schema/store-room.ts`)

Columns:

- `id` `varchar(36)` PRIMARY KEY
- `name` `varchar(255)` NOT NULL
- `description` `text` NULL
- `created_at` `timestamp` NOT NULL DEFAULT now
- `updated_at` `timestamp` NOT NULL DEFAULT now ON UPDATE now

Purpose:

- Represents store-room level container metadata.
- Does not directly store product quantities.

### `section` (`src/db/schema/section.ts`)

Columns:

- `id` `varchar(36)` PRIMARY KEY
- `store_room_id` `varchar(36)` NOT NULL
- `name` `varchar(255)` NOT NULL
- `location` `varchar(255)` NOT NULL
- `description` `text` NULL
- `created_at` `timestamp` NOT NULL DEFAULT now
- `updated_at` `timestamp` NOT NULL DEFAULT now ON UPDATE now

Constraints/indexes:

- FK: `store_room_id` -> `store_room.id` (`ON DELETE CASCADE`)
- Index: `section_store_room_id_idx` on `store_room_id`

Purpose:

- Stores section-level physical location details inside a store room.
- Enables exact location lookup for inventory.

### `section_product` (`src/db/schema/section-product.ts`)

Columns:

- `id` `varchar(36)` PRIMARY KEY
- `section_id` `varchar(36)` NOT NULL
- `product_id` `varchar(36)` NOT NULL
- `quantity` `int` NOT NULL DEFAULT `0`
- `created_at` `timestamp` NOT NULL DEFAULT now
- `updated_at` `timestamp` NOT NULL DEFAULT now ON UPDATE now

Constraints/indexes:

- FK: `section_id` -> `section.id` (`ON DELETE CASCADE`)
- FK: `product_id` -> `product.id` (`ON DELETE CASCADE`)
- Unique: `product_id` (one section per product)
- Index: `section_product_section_id_idx` on `section_id`
- Index: `section_product_product_id_idx` on `product_id`

Purpose:

- Maps products to sections with their quantity.
- Serves as the source of truth for store-room inventory location and stock count.

## 10) Relationship Summary

- One user can have many refresh sessions.
- One role can have many users.
- One role can map to many permissions.
- One permission can map to many roles.
- `role_permissions` stores unique role-permission pairs using composite PK.
- One store room can have many sections.
- One section can have many product quantity entries.
- One product maps to exactly one section via unique `section_product.product_id`.

## 11) Dmart Supply Chain System - Roles and Permissions Spec

### Overview

This system is a simplified supply chain workflow for retail stores like Dmart.

It manages:

- Store room (bulk inventory)
- Shelf (customer-facing inventory)
- Stock movement
- Stock requests
- Supply fulfillment

### Core Concepts

#### 1. Store Room (Godown)

- Parent container for inventory sections
- Stores metadata only (not direct product quantity)

#### 2. Section (Inside Store Room)

- Exact physical location inside a store room
- Example: "Aisle-A / Rack-2 / Bin-4"
- Holds per-product quantity via `section_product`

#### 3. Shelf

- Holds limited stock for sale
- Example: 100 shampoos

#### 4. Stock Flow

Refiller:

- Moves stock from store room section to shelf
- Decreases section quantity
- Increases shelf quantity

Billing:

- Reduces shelf quantity when a sale happens

### System Flow

1. Refiller checks shelf stock.
2. Refiller moves stock from store room section to shelf.
3. If store stock is low, refiller creates a stock request.
4. Store Head approves the stock request.
5. Store Head places order to Supply Chain.
6. Supply Chain delivers stock.
7. Store Head updates store room section inventory after delivery.

### Roles

#### Super Admin

- Manages system admins

#### Store Head

- Manages store operations
- Approves stock requests
- Places orders
- Updates store inventory after delivery

#### Supply Chain Head

- Receives stock orders
- Delivers requested products

#### Refiller

- Moves stock (store room to shelf)
- Reads inventory
- Creates stock requests

#### Billing Person

- Handles sales
- Reduces shelf stock
- Reads inventory

### Permissions

#### Inventory

- `read_store_inventory`
- `read_shelf_inventory`

#### Stock Movement

- `move_stock_store_to_shelf` (decreases section stock and increases shelf stock; no direct edit allowed)

#### Billing

- `reduce_shelf_stock`

#### Requests

- `create_stock_request`
- `approve_stock_request`

#### Supply

- `fulfill_stock_request`

#### Store Management

- `update_store_inventory`

#### Admin

- `manage_admins`

### Role to Permission Mapping

#### Super Admin

- `manage_admins`

#### Store Head

- `read_store_inventory`
- `read_shelf_inventory`
- `update_store_inventory`
- `update_shelf_inventory`
- `approve_stock_request`

#### Supply Chain Head

- `fulfill_stock_request`

#### Refiller

- `read_store_inventory`
- `read_shelf_inventory`
- `move_stock_store_to_shelf`
- `create_stock_request`

#### Billing Person

- `read_store_inventory`
- `read_shelf_inventory`
- `reduce_shelf_stock`

### Important Design Rules

1. Refiller cannot directly update section quantity and must use `move_stock_store_to_shelf`.
2. Store Head is the only role that updates store inventory after delivery.
3. Billing affects shelf stock only, not store stock directly.
4. Permission checks must be enforced in APIs instead of role-name checks.

### Data Flow Summary

```txt
Refiller -> move stock -> Shelf
Refiller -> request stock -> Store Head
Store Head -> order -> Supply Chain
Supply Chain -> deliver -> Store Head
Store Head -> update section inventory
Billing -> reduce shelf stock
```

