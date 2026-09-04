# 🔥 Flame & Crust — AI Quick Reference (`readai.md`)

> **គោលបំណង:** ឯកសារនេះសង្ខេបព័ត៌មានសំខាន់ទាំងអស់ពី project Flame & Crust ឲ្យ AI agent យកបានលឿន ដោយមិនចាំបាច់អានច្រើន file។

---

## 1. Project Identity

- **Name:** Flame & Crust — Food & Pizza Ordering E-Commerce Platform
- **Repo:** `Kane-kiraa/flame-crust`
- **License:** MIT

---

## 2. Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Shadcn UI (Radix UI), Lucide Icons |
| **State** | Zustand (cart, user session), TanStack Query |
| **Animations** | Framer Motion, Canvas Confetti, tw-animate-css |
| **Forms** | react-hook-form + zod validation |
| **Payment** | bakong-khqr, qrcode.react |
| **Map** | Leaflet / React-Leaflet |
| **Backend** | Spring Boot 3.5.4, Java 21 |
| **Security** | Spring Security, JWT (HMAC-SHA256, 24h expiry), Bucket4j rate limiting |
| **Database** | MySQL 8.4, Spring Data JPA + JdbcTemplate, Flyway Migration |
| **PWA** | vite-plugin-pwa (manifest, logo-192.png, logo-512.png) |
| **DevOps** | Docker (multi-stage), GitHub Actions CI/CD |
| **Hosting** | Render (Backend), Vercel (Frontend), Aiven (Cloud MySQL) |
| **Tunnels** | Cloudflare tunnels via `run_tunnels.py` |

---

## 3. Project Structure

```text
flame-crust-source/
├── backend/
│   ├── src/main/java/com/flamecrust/api/    # REST Controllers, Services, Repos, Models
│   ├── src/main/resources/db/               # SQL schema + seed data (auto-run on start)
│   ├── docker-compose.yml                   # Docker MySQL setup
│   ├── pom.xml                              # Maven dependencies
│   ├── Dockerfile
│   └── .env                                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx                          # Main app + routing
│   │   ├── main.jsx                         # Entry point
│   │   ├── app/globals.css                  # Design system (OKLCH themes, dark mode)
│   │   ├── components/
│   │   │   ├── ui/                          # Shadcn UI primitives (Button, Card, Input, Dialog...)
│   │   │   ├── food/                        # Domain components (Menu, Cart Drawer, Food Card, Hero, Map)
│   │   │   ├── shared/                      # Data tables, Empty states
│   │   │   ├── ImageUpload.jsx
│   │   │   └── theme-provider.jsx
│   │   ├── pages/
│   │   │   ├── home.jsx, menu.jsx, cart.jsx, checkout.jsx
│   │   │   ├── product-detail.jsx, payment.jsx
│   │   │   ├── order-confirmation.jsx, order-tracking.jsx
│   │   │   ├── login.jsx, profile.jsx, leave-review.jsx
│   │   │   ├── admin/                       # Admin Dashboard pages
│   │   │   ├── driver/                      # Driver App pages
│   │   │   └── kitchen/                     # Kitchen Display System (KDS)
│   │   ├── lib/
│   │   │   ├── api.js                       # API client (primary — use this)
│   │   │   ├── food-api.jsx                 # Food-specific API helpers
│   │   │   ├── cart-store.jsx               # Zustand cart state
│   │   │   ├── store.js                     # Zustand general state
│   │   │   ├── cloudinary.js                # Image upload
│   │   │   ├── utils.jsx                    # Utilities
│   │   │   └── webrtc.js                    # WebRTC for calls
│   │   └── hooks/                           # Custom React hooks
│   ├── vite.config.js                       # Vite + PWA config
│   └── package.json
├── run_tunnels.py                           # Cloudflare tunnel script
├── start.sh                                 # Startup script
├── Dockerfile                               # Root Docker build
└── z-folder1/                               # Documentation archive
```

---

## 4. Run Locally

### Backend (port 8080)
```bash
cd backend
sudo systemctl start mysql
set -a; source .env; set +a
./mvnw spring-boot:run
```

### Frontend (port 3000)
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend `.env`:**
```env
MYSQL_URL=jdbc:mysql://localhost:3306/flame_crust?createDatabaseIfNotExist=true&serverTimezone=UTC
MYSQL_USER=root
MYSQL_PASSWORD=<password>
JWT_SECRET=<256bit_key>
JWT_EXPIRATION=86400000
MAIL_USERNAME=<email>
MAIL_PASSWORD=<app_password>
BAKONG_API_TOKEN=<token>
PORT=8080
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8080
```

---

## 5. 4 Portals (Apps in 1 System)

1. **Customer Storefront** — Browse menu, cart, checkout, order tracking, reviews
2. **Admin Dashboard** — CRUD for all 18+ tables, analytics, order management
3. **Driver App** — Accept orders, GPS tracking, real-time location updates
4. **Kitchen Dashboard (KDS)** — Kanban board for kitchen staff (Confirm → Prepare → Ready)

---

## 6. Design System & UI Rules

- **CSS Framework:** Tailwind CSS v4 — DO NOT write vanilla CSS unless absolutely necessary
- **Theme (OKLCH):** Warm food-oriented with Dark Mode
  - Primary (Deep Crimson Red): `bg-primary text-primary-foreground`
  - Accent (Warm Amber): `bg-accent text-accent-foreground`
  - Background (Warm Cream/Dark): `bg-background text-foreground`
- **Typography:**
  - Sans-serif (`font-sans`): **Inter** — body and UI
  - Serif (`font-serif`): **Playfair Display / Georgia** — headings h1-h6
- **Icons:** `lucide-react` exclusively
- **Toasts:** `sonner` — `import { toast } from "sonner"`
- **Components:** ALWAYS use `src/components/ui/` (Shadcn/Radix) — never raw HTML
- **Animations:** `framer-motion` for transitions, `tw-animate-css` for utilities

---

## 7. API Reference

### Base URLs
- Local: `http://localhost:8080/api`
- Production: `https://flame-crust-backend.onrender.com/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Frontend API Client (`src/lib/api.js`)
```js
import { getProducts, list, create, update, remove, get, getHealth, getDashboard } from "@/lib/api";

const products = await getProducts();          // GET /api/products
const orders = await list("orders");           // GET /api/admin/orders
const item = await get("products", 1);         // GET /api/admin/products/1
await create("coupons", data);                 // POST /api/admin/coupons
await update("orders", id, { status: "CONFIRMED" }); // PUT /api/admin/orders/{id}
await remove("coupons", id);                   // DELETE /api/admin/coupons/{id}
```

### Public API
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/products` | All active products |
| `GET` | `/api/products/categories` | Product categories |
| `GET` | `/api/products/{idOrCategory}` | Product by ID or category filter |
| `GET` | `/api/dashboard` | Analytics (revenue, orders, charts) |

### Auth API (`/api/auth/...`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/login` | Unified login (checks users → customers → drivers) |
| `POST` | `/api/auth/customer-login` | Customer only login |
| `POST` | `/api/auth/customer-register` | Register customer |
| `POST` | `/api/auth/google-login` | Google OAuth login |
| `POST` | `/api/auth/send-otp` | Send OTP email |
| `POST` | `/api/auth/verify-otp` | Verify OTP & login |
| `POST` | `/api/auth/driver-login` | Driver login |
| `POST` | `/api/auth/driver-register` | Register driver |
| `GET`  | `/api/auth/driver-me` | Driver profile (requires JWT) |
| `PUT`  | `/api/auth/driver-location` | Update driver GPS |
| `POST` | `/api/auth/admin-login` | Admin login |
| `POST` | `/api/auth/kitchen-login` | Kitchen display login |
| `POST` | `/api/auth/customer-change-password` | Change customer password |
| `POST` | `/api/auth/customer-update-profile` | Update customer profile |
| `GET`  | `/api/auth/customer-profile-data` | Sync customer profile |

### Order Chat & Calls API
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET/POST` | `/api/auth/order-messages` | Get/send order chat messages |
| `POST` | `/api/auth/order-messages/read` | Mark messages as read |
| `POST` | `/api/auth/order-chat/typing` | Send typing indicator |
| `POST` | `/api/auth/active-calls/start` | Start voice call |
| `POST` | `/api/auth/active-calls/answer` | Answer call |
| `POST` | `/api/auth/active-calls/end` | End call |

### Payment API
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/payments/verify-khqr` | Verify KHQR payment (Bakong) |

### Universal Admin CRUD (`/api/admin/{resource}`)
```
GET    /api/admin/{resource}            — List + search (?search=...&page=0&limit=10)
GET    /api/admin/{resource}/{id}       — Get by ID
POST   /api/admin/{resource}            — Create
PUT    /api/admin/{resource}/{id}       — Update
DELETE /api/admin/{resource}/{id}       — Delete
```

**31 Supported Resources:**
`users`, `roles`, `customers`, `addresses`, `categories`, `products`, `product_options`, `product_variants`, `product_recipes`, `reviews`, `orders`, `order_items`, `order_status_history`, `order_messages`, `payments`, `payment_attempts`, `coupons`, `coupon_usages`, `drivers`, `driver_locations`, `kitchen_staff`, `branch_staff`, `branches`, `carts`, `cart_items`, `ingredients`, `ingredient_stock`, `inventory`, `cash_register_sessions`, `otps`, `audit_logs`

### Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

---

## 8. Database (18 Core Tables)

### Users & Accounts
| Table | Description |
|:---|:---|
| `roles` | Staff roles + JSON permissions |
| `users` | Admin/Manager/Staff accounts |
| `customers` | Customer accounts (email, phone, password_hash) |
| `addresses` | Customer delivery addresses (label, city, lat/lng, is_default) |

### Catalog
| Table | Description |
|:---|:---|
| `categories` | Product categories (slug, name, sort_order, active) |
| `products` | Products (sku, name, price, image, rating, tags, popular, spicy, vegetarian) |
| `product_options` | Options per product (Size, Crust Type, is_required) |
| `product_variants` | Option values + price_adjustment (+$2.00) |
| `reviews` | Customer ratings (1-5) + comments |

### Cart & Promotions
| Table | Description |
|:---|:---|
| `carts` | One cart per customer |
| `cart_items` | Products in cart (quantity, JSON options) |
| `coupons` | Discount codes (PERCENTAGE, FIXED, FREE_DELIVERY) |

### Orders & Payments
| Table | Description |
|:---|:---|
| `orders` | Order info (order_number, customer, address, coupon, driver, status, totals) |
| `order_items` | Line items (product_name snapshot, quantity, unit_price, line_total, JSON options) |
| `payments` | Payment records (method, status, amount, transaction_id) |

### Delivery & Security
| Table | Description |
|:---|:---|
| `drivers` | Delivery drivers (name, phone, vehicle_info, status: ONLINE/BUSY/OFFLINE) |
| `otps` | OTP codes (target, 6-digit code, is_used, expires_at) |
| `audit_logs` | Admin action history (user_id, action, table_name, old_data, new_data JSON) |

### Key Relationships
```
roles → users → audit_logs
customers → addresses, carts → cart_items, orders → order_items, reviews
categories → products → product_options → product_variants
orders → payments (1:1), orders → drivers
coupons → orders
```

---

## 9. Business Flows

### Customer Order Flow
```
Browse Products → Select Product/Variant → Add to Cart → Apply Coupon (optional)
→ Select Address → Create Order (PENDING) → Choose Payment → Confirm/KHQR Verify
→ Order Tracking → Delivery → Review
```

### Order Status Lifecycle
```
PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
                                                              (or CANCELLED from PENDING/CONFIRMED/PREPARING)
```

### Payment Flow
- **Methods:** CASH, CARD, ABA_PAY, WING, OTHER
- **Statuses:** PENDING → PAID / FAILED, PAID → REFUNDED
- **KHQR:** Frontend polls `GET /api/payments/verify/{md5}` every 3 seconds until SUCCESS

### Auth Flow (Unified Login)
1. Backend checks `users` table first (Admin/Staff)
2. If not found → checks `customers` table
3. If not found → checks `drivers` table
4. Password verification: BCrypt → fallback SHA-256 (auto-upgrade old hashes)
5. Returns JWT token with role (ADMIN/CUSTOMER/DRIVER)
6. Frontend stores in `localStorage` (`adminAuth`, `customerAuth`, `driverAuth`)

---

## 10. Security Mechanisms

| Feature | Detail |
|:---|:---|
| **Rate Limiting** | Bucket4j: 100 login/15min, 100 OTP/10min |
| **Password** | BCrypt hashing, SHA-256 backward compat + auto-upgrade |
| **JWT** | HMAC-SHA256, 24h expiry, role-based (ADMIN/CUSTOMER/DRIVER) |
| **OTP** | 6-digit SecureRandom, 5min expiry, single-use |
| **Google OAuth** | react-oauth/google, auto-create customer |
| **Frontend Lock** | 10-min cooldown on OTP rate limit |

---

## 11. Deployment

| Component | Platform | Config |
|:---|:---|:---|
| **Database** | Aiven MySQL 8.4 | Free tier, SSL required |
| **Backend** | Render.com | Docker Web Service, keep-alive via cron-job.org ping every 10min |
| **Frontend** | Vercel | Vite preset, root: `frontend/`, env: `VITE_API_URL` |
| **CI/CD** | GitHub Actions | Auto build+test on push, skip with `[skip ci]` in commit msg |

---

## 12. Critical Rules for AI Agents

### DO ✅
1. Use `src/components/ui/` (Shadcn) for all UI components — never raw HTML elements
2. Use `@/lib/api` for ALL API calls — never fetch directly
3. Use `lucide-react` for icons
4. Use `sonner` for toast notifications
5. Keep UI responsive (mobile + tablet + desktop)
6. Add loading, error, empty states, and retry on every API-calling page
7. Use `VITE_API_URL` from `.env` — never hard-code URLs
8. Run `npm run build` and `npm run lint` after changes
9. Maintain brand identity (warm crimson/amber, Inter + Playfair Display fonts)
10. Show user-friendly error messages — never raw server errors

### DON'T ❌
1. Don't break existing UI in `src/components/food/`
2. Don't use mock data when backend API has real data
3. Don't expose `password_hash`, OTP codes, or sensitive audit data to customers
4. Don't change `run_tunnels.py` to use `process.communicate()` synchronously
5. Don't use non-square images for PWA icons (Chrome rejects them)
6. Don't write vanilla CSS — use Tailwind CSS v4
7. Don't use colors/fonts that conflict with brand (crimson/amber/cream theme)
8. Don't hard-code production URLs
9. Don't remove existing comments/docstrings unrelated to your changes

---

## 13. Known Limitations / Future Improvements

- **No WebSockets:** Uses polling for real-time — driver location, order updates, chat
- **No Inventory Tracking:** No stock_quantity field, no auto-deduct on sale
- **1:1 Payment:** Cannot retry payment on same order (UNIQUE constraint on order_id)
- **No Multi-Branch:** Single-store architecture only
- **No Loyalty Program:** No points, VIP tiers, or digital wallet
- **No Auto-Refund:** Cancelled orders with KHQR payment need manual refund
- **No Multi-Language:** Single language content (no i18n for product names/descriptions)
- **No Kitchen Timestamps:** No `prepared_at`/`ready_at` for cook time analytics
- **Cart Price Drift:** No price snapshot in cart_items — prices can change while in cart

---

> 📁 **Source docs:** This file was generated from `README.md`, `backend/README.md`, `frontend/README.md`, `z-folder1/AI.md`, `z-folder1/API_DOCUMENTATION.md`, `z-folder1/DATABASE_STRUCTURE.md`, `z-folder1/DATABASE_FLOW.md`, `z-folder1/LOGIN_FLOW.md`, `z-folder1/FRONTEND_NEXT_STEPS.md`, `z-folder1/FRONTEND_IMPLEMENTATION_PROMPT.md`, `z-folder1/PROJECT_ANALYSIS.md`, `z-folder1/deploy.md`, `z-folder1/README.md`.
