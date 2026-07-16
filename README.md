# 🌶️ Nirmal's Spices — Full-Stack E-Commerce Platform

> Production-grade e-commerce web application for **Nirmal's Spices** — a manufacturer, supplier, and exporter of 43 varieties of authentic Indian spices sourced from Harda, Madhya Pradesh.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Features](#-features)
5. [Architecture & Workflow](#-architecture--workflow)
6. [Prerequisites](#-prerequisites)
7. [Environment Setup](#-environment-setup)
8. [Installation & Running Locally](#-installation--running-locally)
9. [API Reference](#-api-reference)
10. [Order & Payment Flow](#-order--payment-flow)
11. [Admin Capabilities](#-admin-capabilities)
12. [Deployment](#-deployment)
13. [Security](#-security)

---

## 🏪 Project Overview

This is a **monorepo** containing three workspaces:

| Workspace | Description |
|-----------|-------------|
| `api/` | REST API — Express.js + TypeScript + MongoDB |
| `web/` | Next.js storefront — React 19 + Tailwind CSS v4 |
| `frontend/` | Legacy static HTML prototype (reference only, not active) |

**Business context:**
- Client: Nirmal's Spices, Harda, Madhya Pradesh
- Products: 43 varieties across 6 categories (Blend Spices, Ground Spices, Whole Spices, Salts & Sugars, Flour, Instant Mix)
- Payments: Razorpay (online) + Cash on Delivery
- Contact: +91 9770057005 | info@nirmalspices.in

---

## 🛠️ Tech Stack

### Backend (`api/`)

| Technology | Purpose |
|-----------|---------|
| **Express.js 4** | HTTP server / REST API framework |
| **TypeScript 5** | Type-safe server code |
| **MongoDB + Mongoose 8** | Primary database (products, orders, users, carts) |
| **Redis (ioredis)** | Session caching, OTP storage, idempotency keys, product caching |
| **Razorpay SDK** | Online payment gateway |
| **Resend** | Transactional email (order confirmations, OTPs, welcome emails) |
| **MSG91** | SMS OTP delivery (optional) |
| **Cloudinary** | Product image hosting & management |
| **JWT** | Access + Refresh token auth (httpOnly cookies) |
| **Bcrypt** | Password hashing |
| **Zod** | Runtime schema validation for env + request bodies |
| **Pino** | Structured production logging |
| **Sentry** | Error monitoring (optional) |
| **Helmet + HPP + mongo-sanitize** | Security hardening |

### Frontend (`web/`)

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework (App Router) |
| **React 19** | UI library |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand 5** | Client state management (cart, auth, wishlist, UI) |
| **TanStack React Query 5** | Server state, caching, and background refetch |
| **Axios** | HTTP client with auto-refresh interceptor |
| **React Hook Form + Zod** | Form validation |
| **Framer Motion** | Animations |
| **shadcn/ui + Radix UI** | Accessible component primitives |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |
| **Sentry** | Frontend error monitoring |

---

## 📁 Project Structure

```
nirmal-spices/
├── package.json               ← Root monorepo scripts
│
├── api/                       ← Express REST API
│   ├── src/
│   │   ├── config/            ← DB, Redis, Cloudinary, Razorpay, env validation
│   │   ├── controllers/       ← Business logic handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── coupon.controller.ts
│   │   │   ├── contact.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/        ← Auth, rate limiting, idempotency, audit, validation
│   │   ├── models/            ← Mongoose schemas (User, Product, Cart, Order, OTP, etc.)
│   │   ├── routes/            ← Express routers
│   │   ├── services/          ← Email, SMS services
│   │   ├── utils/             ← apiError, apiResponse, asyncHandler, jwt, logger
│   │   ├── validators/        ← Zod schemas for request bodies
│   │   ├── app.ts             ← Express app setup (middleware, routes)
│   │   └── server.ts          ← HTTP server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── web/                       ← Next.js 16 storefront
│   ├── src/
│   │   ├── app/               ← Next.js App Router pages
│   │   │   ├── (store)/       ← Public store pages (home, shop, product, checkout, order, account)
│   │   │   ├── admin/         ← Admin dashboard pages
│   │   │   └── (auth)/        ← Login, register, forgot-password
│   │   ├── components/        ← Reusable UI components
│   │   │   ├── layout/        ← Header, Footer, AnnouncementBar, CategoryNav
│   │   │   ├── cart/          ← CartSheet (slide-over drawer)
│   │   │   ├── products/      ← ProductCard, QuickViewModal, ProductInfo
│   │   │   ├── auth/          ← LoginForm, RegisterForm
│   │   │   └── common/        ← WhatsAppButton
│   │   ├── store/             ← Zustand stores
│   │   │   ├── cartStore.ts   ← Cart items + API sync
│   │   │   ├── authStore.ts   ← User session state
│   │   │   ├── wishlistStore.ts ← Wishlist + API sync
│   │   │   └── uiStore.ts     ← Modal/sheet open states
│   │   ├── lib/
│   │   │   └── api.ts         ← Axios instance with auto-refresh interceptor
│   │   └── data/
│   │       └── catalog.ts     ← Static product reference data
│   ├── next.config.ts
│   └── package.json
│
└── frontend/                  ← Legacy vanilla HTML/JS (reference only)
```

---

## ✅ Features

### 🛒 Shopping & Cart
- Browse products by category, badge, price range
- Full-text product search (`GET /api/products/search?q=...`)
- Weight variant selection (e.g., 100g, 250g, 500g)
- Slide-over cart with quantity controls and live total
- **Free shipping** on orders over ₹499; ₹40 flat otherwise
- Coupon code support (percentage or flat discount)
- Free shipping progress bar in cart
- **Guest cart** — works without login via `sessionId` (stored in localStorage)
- Guest cart → user cart merge on login

### 💳 Checkout & Payments
- 4-step checkout: Address → Shipping → Payment Method → Review & Place
- **Razorpay** — full online payment with signature verification
- **Cash on Delivery (COD)** — ₹20 extra charge
- Cart clears automatically after successful payment (both COD and Razorpay)
- Idempotency keys prevent duplicate order creation
- Order confirmation email sent immediately on success

### 📦 Orders & Tracking
- Real-time order status timeline (Pending → Confirmed → Processing → Dispatched → Delivered)
- Email notifications at every status change (with tracking number if dispatched)
- **Logged-in users**: view order history at `/account/orders`
- **Guests**: view order confirmation using order ID + email/phone (no login needed)
- Order cancellation with automatic stock restoration

### ❤️ Wishlist
- Toggle products to wishlist (heart icon on product cards)
- **Guest wishlist** stored locally in browser
- **Logged-in wishlist** synced to server (User model) — persists across devices
- Optimistic UI updates with server-side reconciliation

### 👤 Authentication
- Register with name, email, phone, password
- Login via password or OTP (email/SMS)
- Forgot password — reset link via email
- JWT httpOnly cookies (access token 15m, refresh token 7d)
- Auto-refresh interceptor in Axios client

### 📬 Communication
- **Email** (via Resend): Welcome, OTP, Order Confirmation, Order Status, Newsletter
- **WhatsApp** floating button — links directly to `wa.me/919770057005`
- **Contact Form** — submits to support via API
- **Newsletter** subscription/unsubscribe with token

### 🔍 Reviews
- Customers can submit star ratings and text reviews per product
- Admin can manage reviews

---

## 🔄 Architecture & Workflow

### Full Order Flow

```
Customer browses products
        │
        ▼
Add to Cart (guest sessionId or userId)
        │
        ▼
Checkout Step 1: Enter delivery address
        │
        ▼
Checkout Step 2: Confirm shipping method & cost
        │
        ▼
Checkout Step 3: Select Payment (Razorpay / COD)
        │
        ├── COD ──────────────────────────────────────────►
        │                                                   │
        │                                          POST /orders/create
        │                                          (MongoDB transaction)
        │                                          • Stock reserved ✅
        │                                          • Cart cleared ✅
        │                                          • Email sent ✅
        │                                          • Redirect to /order/:id
        │
        └── Razorpay ─────────────────────────────────────►
                                                            │
                                               POST /orders/create
                                               → Gets Razorpay order ID
                                                            │
                                               Razorpay modal opens
                                               (customer pays)
                                                            │
                                               POST /orders/verify
                                               (signature check)
                                                            │
                                               Cart cleared ✅
                                               Redirect to /order/:id
                                                            │
                                               (Webhook also fires
                                                for reconciliation)
```

### Auth Flow

```
Register/Login → JWT (httpOnly cookies: access_token + refresh_token)
                                 │
                        API calls include cookies automatically
                                 │
                    401 response → Axios interceptor auto-calls
                    POST /auth/refresh → issues new access_token
                                 │
                    Redirect to /login only if refresh also fails
```

### Caching Strategy (Redis)

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `products:{hash}` | 5 min | Product listing pages |
| `product:{slug}` | 5 min | Individual product details |
| `otp:{type}:{identifier}` | 5 min | Email/SMS OTP codes |
| `rt:{userId}:{tokenId}` | 7 days | Refresh token store |
| `idem:{key}` | 24 hrs | Idempotency keys (duplicate order prevention) |
| `rl:{type}:{ip}` | varies | Rate limit counters |

---

## 📋 Prerequisites

Make sure the following are installed on your machine:

| Tool | Version |
|------|---------|
| **Node.js** | ≥ 20.0.0 |
| **npm** | ≥ 9.0.0 |
| **MongoDB** | Atlas cluster OR local ≥ 6.0 |
| **Redis** | Upstash / Redis Cloud / local ≥ 6.0 |

---

## 🔧 Environment Setup

### 1. Create `api/.env`

Copy the example and fill in all values:

```bash
cp api/.env.example api/.env
```

```env
# ── Server ──────────────────────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# ── Database ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nirmal-spices?retryWrites=true&w=majority

# ── Redis ────────────────────────────────────────────────
# Local:
REDIS_URL=redis://localhost:6379
# Upstash (cloud):
# REDIS_URL=rediss://:password@your-host.upstash.io:6380

# ── JWT Secrets (generate with: openssl rand -hex 32) ────
JWT_ACCESS_SECRET=your_64_char_random_secret_here
JWT_REFRESH_SECRET=your_other_64_char_random_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Razorpay ─────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ── Cloudinary (product images) ──────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=nirmal-spices

# ── Email (Resend) ───────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxx
EMAIL_FROM=noreply@nirmalspices.in
EMAIL_REPLY_TO=support@nirmalspices.in

# ── SMS OTP — MSG91 (optional) ───────────────────────────
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=

# ── Error Monitoring (optional) ──────────────────────────
SENTRY_DSN=
ADMIN_EMAIL=admin@nirmalspices.in
```

### 2. Create `web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## 🚀 Installation & Running Locally

### Option A — Run Everything from Root (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd "Nirmal spices"

# Install all dependencies (web + api)
npm run install:all

# Start both servers simultaneously
npm run dev
```

This runs:
- API at `http://localhost:5000`
- Web at `http://localhost:3000`

### Option B — Run Individually

```bash
# Terminal 1 — API
cd api
npm install
npm run dev

# Terminal 2 — Web
cd web
npm install
npm run dev
```

### Build for Production

```bash
# Build API (TypeScript → JavaScript)
npm run build:api

# Build Web (Next.js production bundle)
npm run build:web

# Start API in production
cd api && npm start

# Start Web in production
cd web && npm start
```

---

## 📡 API Reference

### Base URL
```
Development:  http://localhost:5000/api
Production:   https://your-api-domain.com/api
```

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Register new user |
| `POST` | `/login` | Public | Login with email + password |
| `POST` | `/send-otp` | Public | Send OTP to email or phone |
| `POST` | `/verify-otp` | Public | Verify OTP code (login) |
| `POST` | `/refresh` | Cookie | Refresh access token |
| `POST` | `/logout` | Auth | Revoke refresh token |
| `POST` | `/forgot-password` | Public | Send password reset email |
| `POST` | `/reset-password` | Public | Reset with token |
| `GET` | `/me` | Auth | Get logged-in user profile |
| `PUT` | `/me` | Auth | Update profile |
| `POST` | `/me/addresses` | Auth | Add delivery address |
| `PUT` | `/me/addresses/:id` | Auth | Update address |
| `DELETE` | `/me/addresses/:id` | Auth | Delete address |

### Product Routes — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Public | List products (filter, sort, paginate) |
| `GET` | `/search?q=...` | Public | Full-text search |
| `GET` | `/:slug` | Public | Single product by slug |
| `POST` | `/` | Admin | Create product (with images) |
| `PUT` | `/:id` | Admin | Update product |
| `DELETE` | `/:id` | Admin | Delete product + Cloudinary cleanup |

**Query params for `GET /`:**
- `category` — `blend-spices | ground-spices | whole-spices | salts-sugars | flour | instant-mix`
- `badge` — `bestseller | new | sale | organic | premium`
- `sort` — `price-asc | price-desc | rating | -createdAt`
- `page`, `limit` — pagination
- `minPrice`, `maxPrice` — price filter

### Cart Routes — `/api/cart`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Optional | Get cart (user or guest) |
| `POST` | `/add` | Optional | Add item to cart |
| `PUT` | `/update` | Optional | Update item quantity |
| `DELETE` | `/remove/:productId/:weight` | Optional | Remove item |
| `DELETE` | `/clear` | Optional | Empty cart |

> **Guest carts**: Pass `X-Guest-Session-Id` header with a UUID stored in localStorage.

### Order Routes — `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/create` | Optional | Create order (COD or Razorpay) |
| `POST` | `/verify` | Optional | Verify Razorpay payment signature |
| `POST` | `/webhook` | Public | Razorpay webhook (HMAC verified) |
| `GET` | `/guest/:id?email=` | Public | Guest order lookup |
| `GET` | `/` | Auth | My orders list |
| `GET` | `/:id` | Auth | Order details |
| `PUT` | `/:id/cancel` | Auth | Cancel order + restore stock |
| `GET` | `/admin/all` | Admin | All orders with filters |

### Wishlist Routes — `/api/wishlist`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Auth | Get wishlist (populated products) |
| `POST` | `/toggle` | Auth | Add/remove product |
| `DELETE` | `/clear` | Auth | Clear wishlist |

### Admin Routes — `/api/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard` | Admin | Sales stats, revenue, low stock |
| `GET` | `/users` | Admin | All users (paginated) |
| `PUT` | `/users/:id/block` | Admin | Block/unblock user |
| `PUT` | `/orders/:id/status` | Admin | Update order status + tracking |
| `GET` | `/audit-logs` | Admin | Admin action history |

### Coupon Routes — `/api/coupons`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/validate` | Optional | Validate and get discount |
| `POST` | `/` | Admin | Create coupon |
| `GET` | `/` | Admin | List all coupons |
| `DELETE` | `/:id` | Admin | Delete coupon |

### Contact Routes — `/api/contact`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Public | Submit contact form |
| `POST` | `/newsletter/subscribe` | Public | Subscribe to newsletter |
| `GET` | `/newsletter/unsubscribe?token=` | Public | Unsubscribe |

---

## 💰 Order & Payment Flow

### COD (Cash on Delivery)

```
POST /api/orders/create
  Body: { items, address, paymentMethod: "cod", couponCode? }
  Header: X-Idempotency-Key: <uuid>
  
Response:
  { orderId, paymentMethod: "cod", total }

Side effects:
  ✅ Stock reserved (MongoDB transaction)
  ✅ Cart cleared
  ✅ Order confirmation email sent
  ✅ ₹20 COD charge added to total
```

### Razorpay (Online Payment)

```
Step 1 — Create Order:
  POST /api/orders/create
    Body: { items, address, paymentMethod: "razorpay" }
    Response: { orderId, razorpayOrderId, key, total }

Step 2 — Frontend opens Razorpay modal
  (customer enters card/UPI/netbanking)

Step 3 — Payment success callback:
  POST /api/orders/verify
    Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }
    → HMAC signature verified server-side
    ✅ Order marked as "confirmed"
    ✅ Cart cleared
    ✅ Email sent

Step 4 — Webhook (background reconciliation):
  POST /api/orders/webhook
    → Razorpay sends order.paid / payment.failed events
    → Idempotent: uses Redis to prevent duplicate processing
    → Restores stock if payment.failed
```

### Shipping Rules

| Cart Total | Shipping Fee |
|-----------|-------------|
| < ₹499 | ₹40 |
| ≥ ₹499 | FREE |
| COD (any amount) | +₹20 extra |

---

## 🔐 Admin Capabilities

Admin users (role: `admin`) have access to:

| Feature | Endpoint |
|---------|----------|
| Dashboard stats (revenue, orders, users, low stock) | `GET /api/admin/dashboard` |
| List all orders with search & filters | `GET /api/orders/admin/all` |
| Update order status & add tracking number | `PUT /api/admin/orders/:id/status` |
| Manage products (create/update/delete + images) | `POST/PUT/DELETE /api/products` |
| Block/unblock users | `PUT /api/admin/users/:id/block` |
| View audit logs | `GET /api/admin/audit-logs` |

**Status lifecycle:**
```
pending → confirmed → processing → dispatched → out-for-delivery → delivered
                                        ↘ cancelled
                                        ↘ refunded
```

### Creating an Admin User

Run in MongoDB shell or a script:
```js
db.users.updateOne(
  { email: "admin@nirmalspices.in" },
  { $set: { role: "admin" } }
)
```

---

## 🚢 Deployment

### Recommended Stack

| Service | Purpose |
|---------|---------|
| **Render** | API server (Node.js web service) — `render.yaml` included |
| **Vercel** | Next.js frontend (zero-config deployment) |
| **MongoDB Atlas** | Managed MongoDB cloud database |
| **Upstash** | Serverless Redis (free tier available) |
| **Cloudinary** | Product image CDN |
| **Resend** | Transactional email |

### Render (API)

A `render.yaml` is included. Set the following environment variables in Render dashboard — copy from `api/.env`.

### Vercel (Web)

```bash
cd web
npx vercel deploy
```

Set `NEXT_PUBLIC_API_URL` to your Render API URL.

### Razorpay Webhook Setup

In Razorpay Dashboard → Webhooks:
- URL: `https://your-api-domain.com/api/orders/webhook`
- Events: `order.paid`, `payment.failed`
- Copy the webhook secret → set as `RAZORPAY_WEBHOOK_SECRET` in `.env`

---

## 🔒 Security

| Mechanism | Implementation |
|-----------|---------------|
| Auth tokens | httpOnly + SameSite cookies (no localStorage JWT) |
| Password hashing | bcrypt with salt rounds 12 |
| NoSQL injection | `express-mongo-sanitize` |
| HTTP parameter pollution | `hpp` middleware |
| Security headers | `helmet` |
| Rate limiting | Per-IP limits on auth, upload, and API routes |
| Payment verification | HMAC-SHA256 Razorpay signature check |
| Webhook verification | Raw body HMAC verify before processing |
| Idempotency | Redis-backed key to prevent duplicate orders |
| Audit logs | All admin actions recorded in `AuditLog` collection |
| Input validation | Zod schemas on every request body |
| CORS | Restricted to `CLIENT_URL` + localhost:3000 |

---

## 📞 Support

- **WhatsApp**: +91 9770057005
- **Email**: info@nirmalspices.in
- **Location**: Harda, Madhya Pradesh, India

---

*Built with ❤️ for Nirmal's Spices*
