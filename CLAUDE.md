# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Monorepo for **Nirmal's Spices**, an e-commerce storefront + admin panel. Two active workspaces:

- `backend/` — Express 4 + TypeScript REST API, MongoDB (Mongoose), optional Redis.
- `frontend/` — Next.js 16 (App Router) + React 19 + Tailwind v4 storefront and admin UI.

`legacy-frontend/` and the loose `frontend/*.html` files (`index.html`, `checkout.html`, etc.) are a pre-Next.js static prototype kept for reference only — they are not built or served by anything active. Don't edit them when implementing features; the real UI lives in `frontend/src/app`.

## Commands

Run from the repo root (uses `npm --prefix`) or from inside `backend/`/`frontend/` directly.

```bash
# Install
npm run install:all          # installs both frontend and backend deps

# Dev servers
npm run dev                  # both, concurrently (frontend :3000, backend :5000)
npm run dev:frontend
npm run dev:backend

# Build
npm run build:frontend
npm run build:backend
```

### Backend (`backend/`)

```bash
npm run dev                  # ts-node-dev, auto-restart
npm run build                # tsc -> dist/
npm start                    # run compiled dist/server.js

npm test                     # jest --runInBand (all tests)
npx jest tests/auth.test.ts  # single test file
npx jest -t "test name"      # single test by name
npm run test:watch
npm run test:coverage

npm run lint                 # eslint src --ext .ts
npm run format                # prettier --write "src/**/*.ts"

npm run seed                  # ts-node src/scripts/seed.ts (loads catalog.seed.json into Mongo)
npm run db:drop-unused        # ts-node src/scripts/dropUnusedCollections.ts
```

Tests run against mocked Redis/Resend/Razorpay/Cloudinary/Mongoose-transactions (see `backend/tests/setup.ts`) — no live services are required to run `npm test`, but a reachable `MONGODB_URI` (`mongodb://localhost:27017/nirmal-spices-test` by default) is still needed for anything that hits Mongoose models directly.

### Frontend (`frontend/`)

```bash
npm run dev                   # next dev --webpack --port 3000
npm run build                 # next build --webpack
npm start                     # next start --port 3000
npm run lint

npm run test:e2e              # playwright test (auto-starts dev server)
npm run test:e2e:ui
npm run test:e2e:headed
npx playwright test e2e/storefront.test.ts   # single e2e file
```

## Architecture

### Backend request flow

`server.ts` connects Mongo/Redis, starts the pending-order-expiry cron job, then boots `app.ts`. `app.ts` wires: Sentry (optional) → pino request logging → helmet → CORS (credentialed, allow-list of `CLIENT_URL`) → JSON/urlencoded body parsing (raw body buffer preserved for Razorpay webhook signature verification) → cookie-parser → `express-mongo-sanitize` + `hpp` → rate limiter on `/api` → routes mounted at `/api` (see `backend/src/routes/index.ts` for the full path table: `auth`, `products`, `categories`, `cart`, `orders`, `coupons`, `reviews`, `contact`, `admin`, `wishlist`, `settings`) → Sentry error handler → `notFound`/`errorHandler`.

Env vars are parsed and validated once at startup through a Zod schema in `backend/src/config/env.ts` (`backend/src/config/env.ts:20`) — anything missing/invalid causes an immediate `process.exit(1)` with a printed field-error list. Redis is fully optional and gated by `REDIS_ENABLED`; when disabled, refresh-token reuse detection and idempotency caching are weakened (a warning is logged if this happens in production).

**Auth**: JWT access + refresh tokens in httpOnly cookies (`backend/src/middleware/auth.ts`). `verifyAuth` requires a valid `access_token` cookie and does a lean DB lookup to populate `req.user`; `optionalAuth` does the same but falls through silently for guests; `requireAdmin` checks `req.user.role === 'admin'` and must run after `verifyAuth`.

**Guest cart merge**: unauthenticated carts are tracked by an `x-guest-session-id` header (see `backend/src/controllers/cart.controller.ts`). On login/register the guest cart is merged into the user's cart (item quantities combined, capped at 50) and the guest cart document is deleted.

**Idempotency**: order creation supports an `X-Idempotency-Key` header (`backend/src/middleware/idempotency.ts`). The middleware caches successful JSON responses in Redis for 15 minutes and replays them for repeat keys; without Redis or without the header it's a no-op passthrough.

**Payments**: Razorpay SDK (`backend/src/config/razorpay.ts`) for order creation; webhook signature verification depends on the raw body buffer captured in `app.ts`'s JSON parser `verify` hook — don't remove that when touching body parsing.

### Frontend structure

App Router with three route groups under `frontend/src/app`:
- `(auth)/` — login/register/forgot/reset-password, own layout.
- `(store)/` — the public storefront (home, shop, product, cart/checkout, account, policy pages).
- `admin/` — admin dashboard (products, orders, coupons, categories, customers, settings, logs), protected separately from customer auth.

`frontend/src/middleware.ts` gates `/admin/**` and `/account/**` at the edge by decoding the JWT payload out of the `access_token` cookie (base64, not verified) to redirect unauthenticated or wrong-role users before the page renders; the backend still enforces real authorization on every request, this is only a UX-level guard.

**Same-origin API proxy**: the browser talks to the Express API through a same-origin Next.js rewrite, `/backend-api/:path* -> ${backendOrigin}/api/:path*` (`frontend/next.config.ts`), so httpOnly auth cookies are set on the frontend's own origin instead of cross-site. `frontend/src/lib/api.ts` is the shared Axios instance (`baseURL: /backend-api` by default, `withCredentials: true`) with a response interceptor that queues concurrent requests during a 401 and retries them once after a single `/auth/refresh` call; on refresh failure it clears the Zustand auth/wishlist stores. Server-side code (route handlers, server components) instead uses `getBackendApiUrl()` in `frontend/src/lib/backend.ts`, which resolves an absolute backend URL from `API_URL`/`BACKEND_URL`/`NEXT_PUBLIC_API_URL`.

**State**: Zustand stores in `frontend/src/store/` (`authStore`, `cartStore`, `uiStore`, `wishlistStore`) for client state; TanStack Query for server state/caching. Validation schemas in `frontend/src/validators/` are Zod, mirroring shapes validated server-side in `backend/src/validators/`.

**UI components**: `frontend/src/components/ui/` are shadcn/ui + Radix primitives (generated, edit with care); feature components live under `components/{home,products,cart,auth,admin,layout,...}`.

## Deployment

- Backend deploys to Render (`render.yaml`, `rootDir: backend`) as a standard Node web service — build with `npm install --legacy-peer-deps && npm run build`, start with `npm run start`.
- Frontend deploys to Vercel (`frontend/vercel.json` sets security headers only; build/runtime config lives in `next.config.ts`).
