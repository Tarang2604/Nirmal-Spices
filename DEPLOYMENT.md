# Deployment Guide — Render (backend) + Vercel (frontend)

This repo is deployed as **two separate services**, not a single Vercel monorepo deploy:

| Service | Platform | Why |
|---|---|---|
| `backend/` | [Render](https://render.com) | Needs a long-running process for the `node-cron` pending-order-expiry job (`src/jobs/expirePendingOrders.ts`) and in-memory rate limiting (`express-rate-limit` with no Redis-backed store) — both break on Vercel's serverless functions, which don't keep a persistent process alive or share memory across invocations. |
| `frontend/` | [Vercel](https://vercel.com) | Native Next.js 16 App Router hosting. |

Config files are already in the repo: `render.yaml` (backend Blueprint) and `frontend/vercel.json` (security headers only — Vercel auto-detects the Next.js build).

Both apps currently build, lint, and test clean (`backend`: 8/8 suites, 67/67 tests; `frontend`: production build succeeds).

## Deployment order (must follow this sequence)

Next.js reads `API_URL`/`BACKEND_URL` at **build time** to configure the `/backend-api/:path*` same-origin cookie proxy in `next.config.ts`. That creates a hard ordering dependency:

1. **Deploy backend to Render first** → get its real URL (e.g. `https://nirmal-spices-api.onrender.com`)
2. **Deploy frontend to Vercel**, pointing `API_URL` at that Render URL → get the real Vercel URL (e.g. `https://nirmalspices.vercel.app` or your custom domain)
3. **Go back to Render and update `CLIENT_URL`** to the real Vercel URL, then redeploy the backend (CORS + Razorpay/email links depend on this)

## Step 1 — Backend on Render

1. In Render, create a new **Blueprint** from this repo — it will read `render.yaml` and create the `nirmal-spices-api` web service automatically (root dir `backend`, free plan, `npm install --legacy-peer-deps && npm run build`, `npm run start`).
2. Fill in every env var marked `sync: false` in `render.yaml` via the Render dashboard (they're secrets, so they're not committed):

   | Var | Notes |
   |---|---|
   | `MONGODB_URI` | Production MongoDB connection string |
   | `REDIS_URL` | See "Redis" note below |
   | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Generate fresh 32+ char random secrets — **do not reuse local dev values** |
   | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Live-mode keys from Razorpay dashboard |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Same values as `backend/.env` |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Same Gmail SMTP values as `backend/.env` |
   | `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` | See "SMS OTP" note below |
   | `SENTRY_DSN` | See "Error monitoring" note below |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only used by `npm run seed` — see "Admin credentials" note below |
   | `CLIENT_URL` | **Placeholder for now** (e.g. `https://placeholder.vercel.app`) — you'll overwrite this in Step 3 |

   `NODE_ENV`, `PORT`, `REDIS_ENABLED`, `CLOUDINARY_FOLDER` are already hardcoded in `render.yaml` and don't need dashboard entry. `PAYMENT_TEST_MODE` is deliberately absent — leave it unset so it defaults to `false` (setting it `true` alongside `NODE_ENV=production` hard-crashes the app on startup by design).

3. Deploy. Confirm `GET https://<your-render-url>/health` returns `200 {"status":"ok"}`.
4. Note the final Render URL — you need it for Step 2.

## Step 2 — Frontend on Vercel

1. In Vercel, import this repo as a new project. **Set "Root Directory" to `frontend`** in the project settings — this is the one setting that's easy to miss in a repo with both `backend/` and `frontend/` at the top level.
2. Vercel auto-detects Next.js and runs the `build` script from `frontend/package.json` as-is (including its `--webpack` flag) — no build command override needed.
3. Set this env var in the Vercel dashboard (Production scope):

   | Var | Value |
   |---|---|
   | `API_URL` | The real Render backend URL from Step 1, e.g. `https://nirmal-spices-api.onrender.com` |

   Leave `NEXT_PUBLIC_API_URL` **unset** — its absence is what keeps the frontend calling `/backend-api/...` on its own origin (via the rewrite proxy) instead of cross-origin, which is what makes the httpOnly auth cookies work correctly. `images.remotePatterns` in `next.config.ts` already allow both `res.cloudinary.com` and `nirmalspices.in`, so no config change needed there for the Cloudinary migration.
4. Deploy. Note the real Vercel URL (or your custom domain if you attach one).

## Step 3 — Close the loop on Render

1. Back in Render, update `CLIENT_URL` to the real Vercel URL from Step 2.
2. Redeploy the backend (env var changes require a redeploy on Render).
3. Verify CORS: from the deployed frontend, confirm login/checkout works without CORS errors in the browser console (`backend/src/app.ts` only allows `CLIENT_URL` + `localhost:3000` as CORS origins).

## Post-deploy smoke test

- Register/login (real OTP flow, not test mode)
- Browse products — Cloudinary images load correctly
- Add to cart → checkout → Razorpay payment (live keys) → order confirmation email arrives, correctly branded, no mojibake
- Admin login → view orders, edit a product image
- Delete a product, then visit its old URL directly → confirms it redirects gracefully instead of a raw 404
- Google Maps embed and "leave a review" link (on a delivered order) both work

## Open items to decide before/soon after go-live (not blockers to a first deploy, but flagged)

- **Redis** — `REDIS_ENABLED=false` in `render.yaml` means refresh-token reuse detection and idempotency caching are weakened (per the app's own startup warning). Provisioning a Redis instance (Render add-on or Upstash) and flipping `REDIS_ENABLED=true` + `REDIS_URL` is recommended before a real launch, not required for a first deploy.
- **SMS OTP** — if `MSG91_AUTH_KEY`/`MSG91_TEMPLATE_ID`/`MSG91_SENDER_ID` are left unset, the app logs OTPs as "sent" without actually delivering an SMS. Fine for email-only OTP flows; must be set if you want phone OTP to actually work.
- **Admin credentials** — `backend/src/scripts/seed.ts` defaults to `admin@gmail.com` / `admin123` if `ADMIN_EMAIL`/`ADMIN_PASSWORD` aren't set. Set real values in Render **before** ever running `npm run seed` against the production database.
- **Error monitoring** — if `SENTRY_DSN` is left unset in either Render or Vercel, there's no server-side error monitoring in production beyond logs.
- **Custom domain** — both Render and Vercel support attaching a custom domain (e.g. `nirmalspices.in` for the frontend, `api.nirmalspices.in` for the backend) if desired; not required for a first deploy, but if attached, `CLIENT_URL` and the Vercel `API_URL` must be updated to match, and CORS re-verified.
- **Render free plan** spins down after inactivity, causing a slow "cold start" on the next request (10-50+ seconds). Fine for early testing; worth upgrading to a paid plan before real traffic if that delay would hurt UX (e.g. someone mid-checkout).

## Status

Configuration is prepared and both apps build/test cleanly. **Nothing has been deployed yet** — this is prep only. Actual account creation on Render/Vercel and triggering the first deploy is a manual step for you to do (or ask me to walk through interactively) whenever you're ready, since these are real accounts/production infra rather than something to trigger unprompted.
