# 🚀 Flame & Crust - Backend API Documentation

> **Base URL:**
> - Local: `http://localhost:8080/api`
> - Production: `https://flame-crust-backend.onrender.com/api`
>
> 🌐 **Swagger UI (Interactive API Testing):**
> - Local Swagger UI: `http://localhost:8080/swagger-ui.html`
> - Production Swagger UI: `https://flame-crust-backend.onrender.com/swagger-ui.html`
> - OpenAPI Spec JSON: `http://localhost:8080/v3/api-docs`

---

## 🔑 Headers & Authentication

សម្រាប់រាល់ Request ទាំងអស់ដែលត្រូវការ Auth ឬផ្ញើទិន្នន័យ (POST / PUT / DELETE) ត្រូវប្រាកដថាបានកំណត់ Headers ដូចខាងក្រោម៖

| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | សម្រាប់រាល់ Request Body ដែលជា JSON |
| `Authorization` | `Bearer <TOKEN>` | JWT Token (ប្រសិនបើ Endpoint នោះត្រូវការ Auth) |

---

## 🏥 1. System & Health Check

### `GET /api/health`
- **Description:** ពិនិត្យមើលស្ថានភាពរបស់ Backend Server
- **Response Example:**
  ```json
  {
    "status": "ok",
    "service": "flame-crust-api"
  }
  ```

---

## 🍕 2. Product Catalog API (Public)

### `GET /api/products`
- **Description:** ទាញយកបញ្ជីរាយមុខម្ហូប/ភេសជ្ជៈទាំងអស់ដែលកំពុងលក់ (Active Products)
- **cURL:**
  ```bash
  curl -X GET https://flame-crust-backend.onrender.com/api/products
  ```

### `GET /api/products/categories`
- **Description:** ទាញយកបញ្ជីប្រភេទម្ហូប (Categories) តម្រៀបតាម Sort Order

### `GET /api/products/{idOrCategory}`
- **Description:** ទាញយកព័ត៌មានម្ហូបតាម ID ឬ Filter តាមឈ្មោះ Category
- **Examples:**
  - `GET /api/products/1` (ទាញយកម្ហូប ID 1)
  - `GET /api/products/pizza` (ទាញយកម្ហូបក្នុង Category "pizza")

---

## 🔐 3. Authentication & User API

### 👤 Customer Endpoints

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/customer-login` | Login Customer | `{"email": "user@example.com", "password": "123"}` |
| `POST` | `/api/auth/customer-register` | Register Customer ថ្មី | `{"name": "Jane", "email": "jane@example.com", "password": "123", "phone": "012345678"}` |
| `POST` | `/api/auth/google-login` | Login តាម Google OAuth | `{"credential": "<GOOGLE_ID_TOKEN>"}` |
| `POST` | `/api/auth/send-otp` | ផ្ញើកូដ OTP | `{"destination": "012345678", "type": "PHONE"}` |
| `POST` | `/api/auth/verify-otp` | ផ្ទៀងផ្ទាត់ OTP | `{"destination": "012345678", "code": "123456"}` |
| `POST` | `/api/auth/customer-change-password` | ប្តូរពាក្យសម្ងាត់ | `{"customerId": 1, "oldPassword": "...", "newPassword": "..."}` |
| `POST` | `/api/auth/customer-update-profile` | កែប្រែ Profile | `{"customerId": 1, "name": "Jane Doe", "avatar": "..."}` |
| `GET` | `/api/auth/customer-profile-data` | Sync Profile ចុងក្រោយ | `?customerId=1` |

---

### 🛵 Driver Endpoints

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/driver-login` | Login Driver App | `{"email": "driver@example.com", "password": "123"}` |
| `POST` | `/api/auth/driver-register` | Register Driver Account | `{"name": "Rider 1", "email": "rider@example.com", "phone": "098765432", "password": "123"}` |
| `GET` | `/api/auth/driver-me` | ទាញយក Profile របស់ Driver ដែលកំពុង Login | Header: `Authorization: Bearer <TOKEN>` |
| `PUT` | `/api/auth/driver-profile` | កែប្រែ Driver Profile | `{"name": "New Rider Name"}` |
| `PUT` | `/api/auth/driver-location` | ផ្ញើ GPS Coordinates ទីតាំង Driver | `{"latitude": 11.5564, "longitude": 104.9282}` |

---

### 👨‍🍳 Admin & Kitchen Endpoints

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/admin-login` | Login ប្រព័ន្ធ Admin Portal | `{"username": "admin", "password": "123"}` |
| `POST` | `/api/auth/admin-change-password` | ប្តូរពាក្យសម្ងាត់ Admin | `{"username": "admin", "oldPassword": "...", "newPassword": "..."}` |
| `POST` | `/api/auth/kitchen-login` | Login Kitchen Display System | `{"username": "kitchen1", "password": "123"}` |

---

## 💬 4. Real-time Order Chat & Online Call API

| Method | Endpoint | Description | Query / Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/order-messages` | ទាញយកសារសន្ទនា | `?orderId=100` |
| `POST` | `/api/auth/order-messages` | ផ្ញើសារក្នុង Order Chat | `{"order_id": 100, "sender_type": "CUSTOMER", "message": " Hello!"}` |
| `POST` | `/api/auth/order-messages/read` | Mark សារថាបានអាន | `{"order_id": 100, "reader_type": "DRIVER"}` |
| `POST` | `/api/auth/order-messages/delete` | លុបសារ | `{"message_id": 5, "sender_type": "CUSTOMER"}` |
| `POST` | `/api/auth/order-chat/typing` | ផ្ញើ Typing Status | `{"order_id": 100, "sender_type": "CUSTOMER"}` |
| `GET` | `/api/auth/order-chat/typing` | ពិនិត្យ Typing Status | `?orderId=100&userType=CUSTOMER` |
| `GET` | `/api/auth/active-calls` | ពិនិត្យ Call Status | `?orderId=100` |
| `POST` | `/api/auth/active-calls/start` | ចាប់ផ្តើម Call | `{"order_id": 100, "caller_type": "CUSTOMER"}` |
| `POST` | `/api/auth/active-calls/answer` | ទទួល Call | `{"order_id": 100}` |
| `POST` | `/api/auth/active-calls/end` | បញ្ចប់ Call | `{"order_id": 100}` |

---

## 🇰🇭 5. KHQR Payment Verification API (Bakong)

### `POST /api/payments/verify-khqr`
- **Description:** ផ្ទៀងផ្ទាត់ការទូទាត់ប្រាក់ KHQR ជាមួយ Bakong Open API (settles order ស្វ័យប្រវត្តិពេលទូទាត់រួច)
- **Request Body:**
  ```json
  {
    "orderId": "100",
    "qrCodeString": "00020101021238...",
    "md5": "e10adc3949ba59abbe56e057f20f883e"
  }
  ```

---

## 📊 6. Dashboard Analytics API

### `GET /api/dashboard`
- **Description:** ទាញយកទិន្នន័យសរុបរាយការណ៍ (Total Revenue, Total Orders, Active Drivers, 7-Day Revenue Chart)
- **Response Example:**
  ```json
  {
    "totalRevenue": 1250.50,
    "totalOrders": 85,
    "totalProducts": 32,
    "activeDrivers": 6,
    "recentOrders": [...],
    "chartData": [...]
  }
  ```

---

## ⚡ 7. Universal Admin CRUD Engine (`/api/admin/{resource}`)

ប្រព័ន្ធ Dynamic CRUD សម្រាប់ Admin គ្រប់គ្រងទិន្នន័យលើ **31 Entities**:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/{resource}` | ទាញយកបញ្ជី/Search (`?search=...&page=0&limit=10`) |
| `GET` | `/api/admin/{resource}/{id}` | ទាញយកទិន្នន័យមួយតាម ID |
| `POST` | `/api/admin/{resource}` | បង្កើតទិន្នន័យថ្មី |
| `PUT` | `/api/admin/{resource}/{id}` | កែប្រែទិន្នន័យតាម ID |
| `DELETE` | `/api/admin/{resource}/{id}` | លុបទិន្នន័យតាម ID |

### 📂 List of Supported Resources (`{resource}`):
`users`, `roles`, `customers`, `addresses`, `categories`, `products`, `product_options`, `product_variants`, `product_recipes`, `reviews`, `orders`, `order_items`, `order_status_history`, `order_messages`, `payments`, `payment_attempts`, `coupons`, `coupon_usages`, `drivers`, `driver_locations`, `kitchen_staff`, `branch_staff`, `branches`, `carts`, `cart_items`, `ingredients`, `ingredient_stock`, `inventory`, `cash_register_sessions`, `otps`, `audit_logs`.

---

## 📌 Postman Example: Adding a User (Fixing 404 Error)

ដើម្បីបង្កើត User ថ្មីក្នុង Postman:

- **Method:** `POST`
- **URL:** `https://flame-crust-backend.onrender.com/api/admin/users` *(ត្រូវតែមាន `/api/admin/`)*
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw ➔ JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phone": "012345678",
    "role_id": 1
  }
  ```

---
*Generated for Flame & Crust Project Documentation.*
