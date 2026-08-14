# Frontend ត្រូវបន្ថែមអ្វីខ្លះ?

API client មាននៅ `src/lib/api.js` រួចហើយ។ Frontend ត្រូវបន្ថែម UI និង logic ខាងក្រោម ដើម្បីប្រើ API ទាំងអស់។

## 1. API service

ប្រើ file នេះសម្រាប់ហៅ backend៖

```js
import { getProducts, list, create, update, remove } from "@/lib/api";
```

ឧទាហរណ៍៖

```js
const products = await getProducts();
const customers = await list("customers");
const order = await create("orders", orderData);
await update("orders", order.id, { status: "CONFIRMED" });
await remove("coupons", couponId);
```

## 2. Customer pages

បង្កើត components/pages៖

- `customers-page.jsx` — បង្ហាញបញ្ជីអតិថិជន
- `customer-form.jsx` — បង្កើត និងកែប្រែអតិថិជន
- `customer-addresses.jsx` — គ្រប់គ្រង addresses

API ដែលត្រូវប្រើ៖ `customers`, `addresses`។

## 3. Product management

បង្កើត៖

- `products-page.jsx`
- `product-form.jsx`
- `product-options-form.jsx`
- `reviews-page.jsx`

API៖ `products`, `categories`, `product_options`, `product_variants`, `reviews`។

## 4. Cart និង checkout

បង្កើត៖

- `cart-page.jsx`
- `checkout-page.jsx`
- `order-confirmation.jsx`

API៖ `carts`, `cart_items`, `coupons`, `orders`, `order_items`, `payments`។

## 5. Admin dashboard

បន្ថែម menu និង tables សម្រាប់៖

- Users និង roles
- Customers
- Products
- Orders
- Payments
- Drivers
- Coupons

API៖

```js
const dashboard = await getDashboard();
const orders = await list("orders");
const drivers = await list("drivers");
```

## 6. Loading និង error state

គ្រប់ page ដែលហៅ API គួរមាន៖

- Loading indicator
- Error message
- Empty state
- Retry button

ឧទាហរណ៍៖

```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  getProducts()
    .then(setProducts)
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

## 7. Environment variable

ត្រូវមានក្នុង `frontend/.env`៖

```env
VITE_API_URL=http://localhost:8080/api
```

ពេល deploy ត្រូវប្តូរទៅ URL របស់ production backend។

## 8. សុវត្ថិភាព

Admin pages គួរត្រូវការ login និង role permission មុនហៅ៖

```text
/api/admin/*
```

កុំបង្ហាញ `password_hash`, OTP code ឬ audit data ទៅ public user។

## Frontend files ដែលគួរបន្ថែម

```text
src/lib/api.js                         មានរួច
src/hooks/use-api.js                   optional
src/pages/customers-page.jsx           ត្រូវបន្ថែម
src/pages/orders-page.jsx              ត្រូវបន្ថែម
src/pages/admin-dashboard.jsx          ត្រូវបន្ថែម
src/components/customer-form.jsx       ត្រូវបន្ថែម
src/components/order-form.jsx          ត្រូវបន្ថែម
src/components/data-table.jsx           ត្រូវបន្ថែម
```
