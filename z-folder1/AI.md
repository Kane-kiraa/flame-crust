# Flame Crust Pizza Delivery - AI Documentation

This document provides a comprehensive overview of the "Flame Crust" project structure, technologies, styling conventions, and architectural flow to help AI assistants understand the codebase and write code easily.

## 🚀 1. Project Overview
Flame Crust is a full-stack pizza delivery application containing a Frontend (Customer UI, Admin Dashboard, Driver App) and a Backend API. 
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Shadcn UI (Radix UI)
- **Backend**: Java 21 (Spring Boot) + MySQL 8.4 (via Spring Data JPA/JdbcTemplate)
- **Deployment/Tunnels**: Cloudflare tunnels (`cloudflared`) are used via `run_tunnels.py` to expose both local frontend and backend to public URLs for mobile/PWA testing.

## 📂 2. Folder Structure

### Frontend (`/frontend`)
The frontend is a single-page application built with Vite and React.
- `src/pages/` - Main routing pages categorized by user roles:
  - `admin/` - Admin Dashboard (Dashboard, Product Management, Resource Config).
  - `driver/` - Driver Dashboard and Login.
  - `home.jsx`, `menu.jsx`, `cart.jsx`, `checkout.jsx` - Customer facing pages.
- `src/components/` - Reusable UI components:
  - `ui/` - Shadcn UI/Radix primitives (Buttons, Cards, Dialogs, etc.). **Always use these instead of building custom native elements.**
  - `food/` - Domain-specific components for the pizza app (Menu, Cart Drawer, Food Card, Hero, Map Picker).
  - `shared/` - Shared components across apps (Data tables, Empty states).
- `src/lib/` - State management and utilities:
  - `store.js` & `cart-store.jsx` - Zustand state management.
  - `api.js` & `food-api.jsx` - API integration layers.
- `public/` - Static assets, PWA configuration (`manifest`, `logo-192.png`, `logo-512.png`), and image library.
- `vite.config.js` - Vite configuration, including PWA setup (`vite-plugin-pwa`).

### Backend (`/backend`)
- `pom.xml` - Maven configuration file detailing dependencies.
- `src/main/java/com/flamecrust/api/` - REST API logic.
- `src/main/resources/db/` - Database schema and seed data.
- `docker-compose.yml` - Docker setup for MySQL database.

---

## 🎨 3. Styling & UI Design System (Frontend)
When writing frontend code, strictly adhere to the established design system in `frontend/src/app/globals.css`.

- **Framework**: Tailwind CSS v4 is used extensively. Do not write vanilla CSS unless absolutely necessary (e.g., custom animations).
- **Themes (OKLCH)**: The project uses a warm, food-oriented theme with Dark Mode support.
  - Primary (Deep Crimson Red): `bg-primary text-primary-foreground`
  - Secondary: `bg-secondary text-secondary-foreground`
  - Accent (Warm Amber): `bg-accent text-accent-foreground`
  - Background (Warm Cream/Dark): `bg-background text-foreground`
- **Typography**: 
  - Sans-serif (`font-sans`): Inter (used for body and UI elements).
  - Serif (`font-serif`): Playfair Display / Georgia (used for headings `h1`-`h6`).
- **Icons**: Use `lucide-react` for all icons.
- **Animations**: The project uses `framer-motion` for complex page transitions and interaction animations, along with `tw-animate-css` for utility animations (e.g., `animate-card-fade-in`, `animate-flicker`).
- **Toast Notifications**: Handled by `sonner` (`import { toast } from "sonner";`). Custom styling is already defined in `globals.css`.

---

## 💾 4. State Management & API Flow (Frontend)
- **Global State**: Managed via `zustand` (e.g., cart state, user session).
- **Data Fetching**: API calls are made using standard fetch/axios wrapped in `/src/lib/api.js`.
  - Methods: `list(resource)`, `create(resource, data)`, `update(resource, id, data)`, `remove(resource, id)`.
  - Example: `const products = await list("products");`
- **Forms**: Use `react-hook-form` integrated with `zod` for validation.

---

## 🗄️ 5. Database & Architecture Flow
The database consists of 18 tables spanning across Users, Catalog, Orders, and Security.

- **Customer Flow**: Browse → Add to Cart (`carts` + `cart_items`) → Apply Coupon (`coupons`) → Select Address (`addresses`) → Checkout (`orders` + `order_items`) → Payment (`payments`) → Delivery (`drivers`).
- **Order Statuses**: `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED` (or `CANCELLED`).
- **Payment Methods**: `CASH`, `CARD`, `ABA_PAY`, `WING`, `OTHER`.

### Admin API Structure
The backend provides dynamic CRUD APIs for the 18 resources:
```http
GET    /api/admin/{resource}
POST   /api/admin/{resource}
PUT    /api/admin/{resource}/{id}
DELETE /api/admin/{resource}/{id}
```
*(e.g., `{resource}` can be `products`, `orders`, `customers`, etc.)*

---

## 📝 6. Important Notes & Gotchas for AI
1. **Modifying Tunnels (`run_tunnels.py`)**: The script continuously reads `cloudflared` stderr to prevent buffer deadlocks. Do not change it to use `process.communicate()` synchronously in a way that blocks the stream.
2. **PWA Icons**: The Vite PWA manifest requires exact square images (e.g., `logo-192.png`, `logo-512.png`). Do not use non-square images as Chrome will reject them and fail to show the PWA prompt icon.
3. **UI Consistency**: When building new features, always look in `src/components/ui` for existing Shadcn components (e.g., `<Button>`, `<Card>`, `<Input>`) rather than building raw HTML elements.
4. **Running the App**:
   - Frontend: `cd frontend && npm run dev`
   - Tunnels: `python3 run_tunnels.py` (Must be run at the root directory to expose the app to the internet/mobile).
