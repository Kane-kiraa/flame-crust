# Flame & Crust — អ្វីដែលមាន និង Database Flow

## 1. អ្វីដែលមានក្នុង Project

### Backend

- Java 21
- Spring Boot
- MySQL 8.4
- Spring Data JPA និង JdbcTemplate
- Database schema/seed នៅ `backend/src/main/resources/db/`
- REST API នៅ `backend/src/main/java/com/flamecrust/api/`

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Zustand សម្រាប់ cart state
- API client នៅ `frontend/src/lib/api.js`
- Customer UI៖ Home, Menu, Product Detail, Cart, Checkout និង Order Confirmation
- Admin UI៖ Products, Categories, Customers, Orders, Payments, Drivers និង Coupons

## 2. Database Tables ចំនួន 18

### Users & Accounts

- `roles` — តួនាទី និង permissions របស់ staff
- `users` — គណនី admin/manager/staff
- `customers` — គណនីអតិថិជន
- `addresses` — អាសយដ្ឋានដឹកជញ្ជូនរបស់ customer

### Catalog

- `categories` — ប្រភេទផលិតផល
- `products` — ផលិតផល
- `product_options` — ជម្រើសផលិតផល ដូចជា size ឬ sugar level
- `product_variants` — តម្លៃ/ជម្រើសលម្អិត
- `reviews` — rating និង comment របស់ customer

### Cart & Promotion

- `carts` — cart មួយសម្រាប់ customer ម្នាក់
- `cart_items` — ផលិតផលក្នុង cart
- `coupons` — coupon និង discount

### Orders & Payments

- `orders` — ព័ត៌មាន order សរុប
- `order_items` — ផលិតផលនីមួយៗក្នុង order
- `payments` — ប្រតិបត្តិការទូទាត់

### Delivery & Security

- `drivers` — អ្នកដឹកជញ្ជូន
- `otps` — OTP សម្រាប់ verification
- `audit_logs` — ប្រវត្តិការកែប្រែទិន្នន័យដោយ staff

## 3. Customer Ordering Flow

```text
Browse Products
      ↓
Select Product / Variant
      ↓
Add to Cart
      ↓
carts + cart_items
      ↓
Apply Coupon (optional)
      ↓
Select/Create Customer Address
      ↓
customers + addresses
      ↓
Create Order
      ↓
orders + order_items
      ↓
Choose Payment Method
      ↓
payments
      ↓
Assign Driver
      ↓
Delivery Completed
      ↓
Customer Review
```

## 4. Order Status Flow

```text
PENDING
  → CONFIRMED
  → PREPARING
  → READY
  → OUT_FOR_DELIVERY
  → DELIVERED
```

Order អាចបញ្ចប់ដោយ៖

```text
PENDING / CONFIRMED / PREPARING → CANCELLED
```

## 5. Payment Flow

Payment methods ដែលមាន៖

- `CASH`
- `CARD`
- `ABA_PAY`
- `WING`
- `OTHER`

Payment status៖

```text
PENDING → PAID
PENDING → FAILED
PAID → REFUNDED
```

## 6. Admin Flow

Admin ប្រើសម្រាប់៖

1. គ្រប់គ្រង categories និង products
2. បន្ថែម product options និង variants
3. មើល និងកែ customers/addresses
4. មើល orders និង order items
5. បញ្ជាក់ order និងប្ដូរ status
6. ពិនិត្យ payments
7. គ្រប់គ្រង drivers
8. បង្កើត coupons
9. គ្រប់គ្រង users និង roles
10. ពិនិត្យ audit logs

## 7. API ដែលមាន

### Public API

```text
GET /api/health
GET /api/products
GET /api/products/{category}
GET /api/dashboard
```

### Admin CRUD API

```text
GET    /api/admin/{resource}
GET    /api/admin/{resource}/{id}
POST   /api/admin/{resource}
PUT    /api/admin/{resource}/{id}
DELETE /api/admin/{resource}/{id}
```

`{resource}` អាចជា table ទាំង 18 ក្នុង database។

## 8. Frontend API Usage

```js
import { getProducts, list, create, update, remove } from "@/lib/api";

const products = await getProducts();
const orders = await list("orders");
const newCoupon = await create("coupons", couponData);
await update("orders", orderId, { status: "CONFIRMED" });
await remove("coupons", couponId);
```

## 9. ចំណុចសុវត្ថិភាពដែលត្រូវបន្ថែមមុន Production

- Login និង JWT/session authentication
- Role-based access control សម្រាប់ `/api/admin/*`
- Password hashing និង password reset
- OTP provider ពិតប្រាកដ
- Payment gateway ពិតប្រាកដ
- កុំបង្ហាញ `password_hash`, OTP code និង sensitive audit data
- Validate request body នៅ backend
- កំណត់ CORS និង rate limit
