# Prompt សម្រាប់បន្តការងារ Frontend

អ្នកគឺជា senior frontend developer។ សូមបន្តអភិវឌ្ឍ UI របស់ Flame & Crust Food Delivery ដោយប្រើ React, Vite និង Tailwind CSS ដែលមានក្នុង project រួចហើយ។

## គោលដៅ

ភ្ជាប់ UI ទៅ backend API តាម `src/lib/api.js` ហើយបង្កើត flow ពេញលេញសម្រាប់ customer និង admin។

## រក្សា UI ចាស់ និងកែលម្អឲ្យស្អាតជាងមុន

- ត្រូវរក្សាទម្រង់ UI ចាស់របស់ Flame & Crust ដូចជា brand color, logo, typography, layout, menu card, navbar និង cart experience។
- កុំប្ដូរ design ទាំងស្រុង ឬធ្វើឲ្យ project បាត់អត្តសញ្ញាណដើម។
- កែលម្អឲ្យស្អាត និងទំនើបជាងមុនតាមរយៈ spacing, alignment, border-radius, shadow, hover effect, animation ស្រាលៗ និង visual hierarchy។
- រក្សា content និង user flow ដែលមានស្រាប់ ប៉ុន្តែធ្វើឲ្យ navigation ងាយប្រើ និង page មើលទៅ professional ជាងមុន។
- ត្រូវធានាថា UI responsive និងមិនបាក់នៅ mobile, tablet និង desktop។
- ប្រើ style ដដែលឲ្យមាន consistency រវាង customer UI និង admin dashboard។
- កុំប្រើពណ៌ ឬ font ថ្មីដែលផ្ទុយពី brand ដើម លុះត្រាតែវាជាការកែលម្អដែលសមស្រប។

## ត្រូវធ្វើបន្ថែម

1. បង្កើត customer pages សម្រាប់ menu, product detail, cart, checkout និង order confirmation។
2. បង្កើត admin dashboard សម្រាប់ products, categories, customers, orders, payments, drivers និង coupons។
3. ប្រើ API client ដែលមានស្រាប់៖

   - `getHealth()`
   - `getProducts(category)`
   - `getDashboard()`
   - `list(resource)`
   - `get(resource, id)`
   - `create(resource, data)`
   - `update(resource, id, data)`
   - `remove(resource, id)`

4. គ្រប់ page ត្រូវមាន loading state, error state, empty state និង retry action។
5. បង្កើត reusable components សម្រាប់ table, form, modal, confirmation dialog និង toast notification។
6. បន្ថែម form validation សម្រាប់ customer, address, product, coupon និង order។
7. រក្សា responsive design សម្រាប់ mobile, tablet និង desktop។
8. មិនត្រូវបង្ហាញ `password_hash`, OTP code ឬ audit log sensitive data ទៅ customer។
9. Admin routes ត្រូវមាន role/permission guard នៅពេល authentication ត្រូវបានភ្ជាប់។
10. ប្រើ `VITE_API_URL` ពី `.env` ហើយកុំ hard-code production URL។

## API resources

```text
roles, users, customers, addresses, categories, products,
product_options, product_variants, reviews, carts, cart_items,
coupons, orders, order_items, payments, drivers, otps, audit_logs
```

## ច្បាប់សំខាន់

- កុំបំបែក UI ដែលមានស្រាប់នៅក្នុង `src/components/food`។
- Reuse shadcn/ui components ពី `src/components/ui`។
- ប្រើ `@/lib/api` សម្រាប់ API calls ទាំងអស់។
- កុំប្រើ mock data នៅពេល backend API មានទិន្នន័យរួច។
- បន្ទាប់ពីកែ code ត្រូវរត់ `npm run build` និង `npm run lint`។
- ត្រូវបង្ហាញសារកំហុសដែល user អាចយល់បាន និងកុំបង្ហាញ raw server error ដោយផ្ទាល់។

## Environment

```env
VITE_API_URL=http://localhost:8080/api
```

## Verification

ត្រូវពិនិត្យ៖

- Menu បង្ហាញ products ពី API
- Category filter ដំណើរការ
- Add to cart និង update quantity ដំណើរការ
- Checkout បញ្ជូន order បាន
- Admin CRUD ដំណើរការ
- Mobile layout មិនបាក់
- `npm run build` pass
