-- ==============================================================================
-- Flame & Crust Full Database Migration to Cloud (Aiven MySQL)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
INSERT IGNORE INTO `roles` (`id`, `name`, `permissions`) VALUES 
(1, 'Admin', '{"can_delete": true, "can_manage_users": true}'),
(2, 'Manager', '{"can_delete": false, "can_manage_users": false}'),
(3, 'Staff', '{"can_delete": false, "can_manage_users": false}');

-- 2. Users (Admin)
INSERT IGNORE INTO `users` (`id`, `role_id`, `name`, `email`, `password_hash`, `status`, `created_at`, `deleted_at`) VALUES 
(1, 1, 'Admin', 'admin@flamecrust.com', '$2a$10$Zy5pdLN1kPVsp1cUiTAqcuEjlxu2maJrQbH/cYjAO.0RfAx2Gkzya', 'ACTIVE', '2026-08-16 19:22:51', NULL);

-- 3. Categories
INSERT IGNORE INTO `categories` (`id`, `slug`, `name`, `sort_order`, `active`) VALUES 
(1, 'pizza', 'Pizza', 1, 1),
(2, 'pizza-bagels', 'Pizza Bagels', 2, 1),
(3, 'burgers', 'Burgers', 3, 1),
(4, 'sides', 'Sides', 4, 1),
(5, 'drink', 'Drinks', 5, 1);

-- 4. Coupons
INSERT IGNORE INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `expires_at`, `active`) VALUES 
(1, 'FREEDELIVERY', 'FREE_DELIVERY', 20.00, 29.00, NULL, 1),
(2, 'NEWUSER1', 'FREE_DELIVERY', 0.00, 0.00, NULL, 1),
(3, 'NEWUSER2', 'FREE_DELIVERY', 0.00, 0.00, NULL, 1);

-- 5. Customers
INSERT IGNORE INTO `customers` (`id`, `name`, `email`, `phone`, `created_at`, `updated_at`, `password_hash`, `status`, `deleted_at`) VALUES 
(1, 'Guest Customer', 'guest@flamecrust.com', '0123456789', '2026-08-16 19:22:51', '2026-08-16 19:22:51', NULL, 'ACTIVE', NULL),
(2, 'chanthakhemara', 'chanthakhemara@gmail.com', '012345678', '2026-08-19 12:44:41', '2026-08-19 12:44:41', NULL, 'ACTIVE', NULL),
(3, 'kaosokleng415', 'kaosokleng415@gmail.com', '0887654321', '2026-08-19 13:55:13', '2026-08-19 13:55:13', NULL, 'ACTIVE', NULL),
(4, 'kariulk8', 'kariulk8@gmail.com', '099123456', '2026-08-20 04:55:47', '2026-08-20 04:55:47', NULL, 'ACTIVE', NULL),
(5, 'Chantha Khemara (Kanekira)', 'chanthakhemara12@gmail.com', '0961234567', '2026-08-21 09:06:55', '2026-08-21 09:06:55', NULL, 'ACTIVE', NULL);

-- 6. Addresses
INSERT IGNORE INTO `addresses` (`id`, `customer_id`, `label`, `address_line`, `city`, `postal_code`, `notes`, `is_default`, `created_at`) VALUES 
(1, 3, 'Delivery', 'Independence Monument, Independence Monument Roundabout, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, 120102, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 13:56:23'),
(2, 3, 'Delivery', 'Cellcard office, Samdech Preah Sihanouk Boulevard (Street 274), Sangkat Boeng Reang, Khan Daun Penh, Phnom Penh, 120204, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 14:06:06'),
(3, 3, 'Delivery', 'Independence Monument, Independence Monument Roundabout, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, 120102, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 14:32:42'),
(4, 3, 'Delivery', 'Wat Langkar (Street 55), Sangkat Boeng Reang, Khan Daun Penh, Phnom Penh, 120204, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 14:36:31'),
(5, 3, '1', 'Community (TK31), Sangkat Boeung Salang, Khan Toul Kork, Phnom Penh, 120410, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 14:46:12'),
(6, 2, 'Delivery', 'Community (TK31), Sangkat Boeung Salang, Khan Toul Kork, Phnom Penh, 120410, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 15:16:19'),
(7, 2, 'Delivery', 'Community (TK31), Sangkat Boeung Salang, Khan Toul Kork, Phnom Penh, 120410, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-19 15:46:04'),
(8, 1, 'Delivery', 'Independence Monument, Independence Monument Roundabout, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, 120102, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-20 04:24:08'),
(9, 2, 'Delivery', 'Street 218, Community (TK31), Sangkat Teuk L\'ak Ti Bei, Khan Toul Kork, Phnom Penh, 120410, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-20 04:36:12'),
(10, 2, '1', 'ផ្លូវវង្សគុតបូរី, Phum Phsar Teuk Thla, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh, 120802, Cambodia', 'Phnom Penh', NULL, NULL, 0, '2026-08-20 04:37:15'),
(11, 5, 'Delivery', 'The Plaza Street, Sangkat Veal Vong, Khan Prampir Makara, Phnom Penh, 120307, Cambodia', 'Phnom Penh', NULL, NULL, 1, '2026-08-21 09:08:20');

-- 7. All 54 Original Products
INSERT IGNORE INTO `products` (`id`, `category`, `description`, `image`, `name`, `popular`, `price`, `rating`, `spicy`, `tags`, `vegetarian`, `sku`, `category_id`, `base_price`, `active`, `created_at`, `updated_at`) VALUES 
(1, 'pizza', 'San Marzano tomato, fresh mozzarella and basil on a fermented sourdough crust.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786900587/t82rlj2ukaaj4ofxmvq7.webp', 'Margherita Classica', 1, 16.50, 4.90, 0, 'Bestseller,Wood-fired', 1, 'FC-000001', 1, 16.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(2, 'pizza', 'Spicy cup-and-char pepperoni, double mozzarella and chili honey.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786900619/ca4ywsennatswbxortvs.jpg', 'Pepperoni Diavola', 1, 19.00, 4.80, 1, 'Spicy,Crowd favorite', 0, 'FC-000002', 1, 19.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(3, 'pizza-bagels', 'Toasted everything bagel with tomato sauce, mozzarella and oregano.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902178/z9fkkk483s3g2azbara9.jpg', 'Classic Pizza Bagel', 1, 7.50, 4.90, 0, 'Bestseller,Quick bite', 1, 'FC-000003', 2, 7.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(4, 'burgers', 'Double smashed Angus patties, cheddar, caramelized onions and bacon jam.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902752/uhvwpiolqyqt6gv5rsgl.jpg', 'Flame & Crust Signature', 1, 16.00, 4.90, 0, 'Bestseller,Double patty', 0, 'FC-000004', 3, 16.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(5, 'sides', 'Hand-cut fries with truffle oil, parmesan and garlic aioli.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903252/bgq12fdgpdn3kqlftt2q.webp', 'Truffle Parm Fries', 1, 8.00, 4.90, 0, 'Bestseller,Vegetarian', 1, 'FC-000005', 4, 8.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(6, 'pizza', 'Mozzarella, gorgonzola, fontina and parmesan with walnuts and truffle honey.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787146639/y0vaxiewxcwfmaz6khr5.jpg', 'Quattro Formaggi', 0, 21.00, 4.70, 0, 'Premium,Vegetarian', 1, 'FC-000006', 1, 21.00, 1, '2026-08-16 19:22:50', '2026-08-19 13:37:23'),
(7, 'pizza', 'Roasted peppers, caramelized onions, mushrooms, olives, arugula and balsamic reduction.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786900504/tesx8mayykb21wcp1qy6.jpg', 'Nonna\'s Garden', 0, 18.50, 4.60, 0, 'Vegetarian,Seasonal', 1, 'FC-000007', 1, 18.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(8, 'pizza-bagels', 'Hand-rolled bagel with tomato sauce, double cheese and crisp pepperoni cups.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902194/kn0pub6ugqfsd1af6446.jpg', 'Pepperoni Pizza Bagel', 1, 9.00, 4.80, 1, 'Fan favorite', 0, 'FC-000008', 2, 9.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(9, 'pizza-bagels', 'Mozzarella, cheddar, parmesan and gorgonzola over a sourdough bagel with garlic butter.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902208/e9bno23c1azn6z6lcarg.jpg', 'Four Cheese Pizza Bagel', 0, 8.50, 4.70, 0, 'Vegetarian,Cheesy', 1, 'FC-000009', 2, 8.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(10, 'burgers', 'Angus patty, crispy bacon, gorgonzola, mushrooms, arugula and balsamic glaze.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902771/ovl27xji0e4s67s8ipa6.jpg', 'Bacon Blue Deluxe', 1, 17.50, 4.80, 0, 'Premium,Bold flavor', 0, 'FC-000010', 3, 17.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(11, 'burgers', 'Angus patty, American cheese, lettuce, tomato, onion and secret sauce.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902786/fktpgqdz6lllupjemaus.jpg', 'Classic Cheeseburger', 0, 12.00, 4.70, 0, 'Classic,Family pick', 0, 'FC-000011', 3, 12.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(12, 'burgers', 'Triple Angus, double bacon, cheddar, onion rings, BBQ sauce and jalapeño.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902806/pldrcz8xcczd3wh1prt4.jpg', 'Smokehouse Stack', 0, 19.50, 4.80, 1, 'Spicy,Triple stack', 0, 'FC-000012', 3, 19.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(13, 'sides', 'Eight jumbo wings with house buffalo sauce, vegetables and blue cheese dip.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903276/ymwv0ej7mhgefrqra6so.jpg', 'Buffalo Wings', 0, 12.50, 4.80, 1, 'Spicy,Game day', 0, 'FC-000013', 4, 12.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(14, 'sides', 'Six pillowy garlic knots brushed with herb butter and served with marinara dip.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903295/r5x7ipznucl9k4h0qjua.jpg', 'Garlic Knots', 0, 6.50, 4.70, 0, 'Vegetarian,Shareable', 1, 'FC-000014', 4, 6.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(15, 'sides', 'Sweet onions in buttermilk batter, golden-fried with chipotle ranch dip.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903307/hig28s2moq1zrjlhjkxr.jpg', 'Crispy Onion Rings', 0, 7.00, 4.60, 0, 'Vegetarian,Crispy', 1, 'FC-000015', 4, 7.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(16, 'pizza', 'Calabrese salami, roasted peppers, mozzarella, chili oil and fresh basil.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901536/w46kcma68y9y1lhgzd7j.jpg', 'Spicy Calabrese', 1, 20.00, 4.80, 1, 'Spicy,Wood-fired', 0, 'FC-000016', 1, 20.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(17, 'pizza', 'Prosciutto, mozzarella, parmesan, rocket and lemon olive oil on sourdough.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901552/cinwemvxdvycgau11emj.jpg', 'Prosciutto Verde', 0, 22.00, 4.80, 0, 'Premium,Fresh', 0, 'FC-000017', 1, 22.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(18, 'pizza', 'Roasted chicken, smoked mozzarella, red onion, sweet corn and smoky BBQ glaze.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901568/edrhocyktzgc2qf85ea3.jpg', 'BBQ Chicken Pizza', 1, 19.50, 4.70, 0, 'Crowd favorite,BBQ', 0, 'FC-000018', 1, 19.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:56:03'),
(19, 'pizza', 'Wild mushrooms, mozzarella, garlic cream, thyme and truffle oil.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901583/plgjcvriwz3m0qfhqjqx.jpg', 'Mushroom Truffle Pizza', 0, 20.50, 4.80, 0, 'Vegetarian,Premium', 1, 'FC-000019', 1, 20.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(20, 'pizza-bagels', 'Everything bagel, cheddar, scrambled egg, crispy bacon and tomato relish.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902224/ggcoyusnvq250kxykggz.jpg', 'Breakfast Pizza Bagel', 0, 10.50, 4.60, 0, 'Breakfast,Quick bite', 0, 'FC-000020', 2, 10.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(21, 'pizza-bagels', 'Toasted bagel with cream cheese, mozzarella, jalapeño and crispy crumbs.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902239/iw524a8kjmz345qxfrat.jpg', 'Jalapeno Popper Bagel', 0, 9.50, 4.70, 1, 'Spicy,Cheesy', 1, 'FC-000021', 2, 9.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(22, 'pizza-bagels', 'Mini sourdough bagels with garlic butter, parmesan and parsley.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902254/l77uqplkte4m109dytjt.jpg', 'Garlic Butter Bagel Bites', 0, 7.00, 4.60, 0, 'Vegetarian,Shareable', 1, 'FC-000022', 2, 7.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(23, 'burgers', 'Crispy chicken, slaw, pickles, hot honey and house mayo on a toasted bun.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902822/deut9kz9xjczsrfjuhxb.jpg', 'Crispy Chicken Burger', 1, 15.50, 4.80, 1, 'Spicy,Crowd favorite', 0, 'FC-000023', 3, 15.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(24, 'burgers', 'Angus patty, Swiss cheese, roasted mushrooms, crispy onions and garlic aioli.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902835/vmbpgbwzfy4epvkbnnxc.jpg', 'Mushroom Swiss Burger', 0, 16.50, 4.70, 0, 'Vegetarian option,Premium', 0, 'FC-000024', 3, 16.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(25, 'burgers', 'Double Angus patties, pepper jack, jalapeño relish, crispy onions and hot sauce.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902848/kvnqnzhn3qdsnkcxntbk.jpg', 'Firecracker Burger', 1, 18.50, 4.80, 1, 'Spicy,Double patty', 0, 'FC-000025', 3, 18.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(26, 'sides', 'Crispy fries topped with cheddar sauce, bacon, spring onion and ranch.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903321/unhnnj5zegmirpwpsqje.jpg', 'Loaded Cheese Fries', 1, 10.00, 4.80, 0, 'Crowd favorite,Shareable', 0, 'FC-000026', 4, 10.00, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(27, 'sides', 'Crispy sweet potato fries served with smoked paprika aioli.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903334/zvcakd7xbckgrabiwjoh.jpg', 'Sweet Potato Fries', 0, 8.50, 4.60, 0, 'Vegetarian,Crispy', 1, 'FC-000027', 4, 8.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(28, 'sides', 'Golden fried mozzarella sticks with marinara and basil dip.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903349/i8dubv9n4sbqsbi9jhkc.jpg', 'Mozzarella Sticks', 0, 9.50, 4.70, 0, 'Vegetarian,Shareable', 1, 'FC-000028', 4, 9.50, 1, '2026-08-16 19:22:50', '2026-08-16 19:58:05'),
(29, 'pizza', 'Cup-and-char pepperoni, mozzarella, chili flakes and a sweet honey finish.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786855872/pgvufhxnqwxjr8o0pwgr.jpg', 'Honey Pepperoni', 1, 19.50, 4.90, 1, 'Bestseller,Sweet heat', 0, 'FC-000029', 1, 19.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(30, 'pizza', 'Garlic cream, mozzarella, roasted garlic, parmesan and fresh thyme.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901096/gogieo70g71lilh61fzt.jpg', 'Roasted Garlic Bianca', 0, 18.00, 4.70, 0, 'Vegetarian,Garlicky', 1, 'FC-000030', 1, 18.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(31, 'pizza', 'Basil pesto, mozzarella, cherry tomatoes, zucchini and toasted pine nuts.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901602/axxm9rshosfpqajhekyx.jpg', 'Pesto Garden', 0, 18.50, 4.70, 0, 'Vegetarian,Fresh', 1, 'FC-000031', 1, 18.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(32, 'pizza', 'Pepperoni, sausage, bacon, mozzarella and hot peppers on our sourdough crust.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901617/wihlfw0thkf9qsrnxtcn.jpg', 'Meat Lovers Fire', 1, 22.00, 4.80, 1, 'Spicy,Loaded', 0, 'FC-000032', 1, 22.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(33, 'pizza', 'Pulled pork, smoked mozzarella, pickled onion and applewood BBQ sauce.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786901633/ccjmk6dedw3hk4t78r0a.jpg', 'Applewood BBQ Pizza', 0, 21.00, 4.60, 0, 'BBQ,Premium', 0, 'FC-000033', 1, 21.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(34, 'pizza-bagels', 'Three mini bagels with tomato, mozzarella, basil and olive oil.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902271/gilsiqrktzmlh0ix14t8.jpg', 'Margherita Mini Bagels', 0, 8.00, 4.80, 0, 'Vegetarian,Shareable', 1, 'FC-000034', 2, 8.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(35, 'pizza-bagels', 'Chicken, buffalo sauce, mozzarella, ranch drizzle and celery crunch.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902285/v6zc3jdmrbrjmqvrovor.jpg', 'Buffalo Chicken Bagel', 0, 10.00, 4.70, 1, 'Spicy,Game day', 0, 'FC-000035', 2, 10.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(36, 'pizza-bagels', 'Pepperoni, peppers, onions, mushrooms and mozzarella on mini bagels.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902328/cw1extltuc4crodg0hwb.webp', 'Supreme Bagel Bites', 1, 10.50, 4.70, 0, 'Loaded,Shareable', 0, 'FC-000036', 2, 10.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(37, 'pizza-bagels', 'Spinach, feta, mozzarella, garlic butter and cracked black pepper.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787146709/dejvrwxotdllqe500u4i.jpg', 'Spinach Feta Bagel', 0, 9.00, 4.60, 0, 'Vegetarian,Fresh', 1, 'FC-000037', 2, 9.00, 1, '2026-08-16 19:22:51', '2026-08-19 13:38:31'),
(38, 'burgers', 'Two Angus patties, double bacon, cheddar, pickles and smoky house sauce.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902878/qzruzbrf2pfxpskdu9vm.jpg', 'Double Bacon Smash', 1, 18.00, 4.90, 0, 'Bestseller,Double patty', 0, 'FC-000038', 3, 18.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(39, 'burgers', 'Crispy chicken, pepper jack, slaw, pickles and hot honey glaze.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902895/ejarojzwppq7f7bggysn.jpg', 'Hot Honey Chicken Burger', 1, 16.50, 4.80, 1, 'Spicy,Hot honey', 0, 'FC-000039', 3, 16.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(40, 'burgers', 'Angus patty, bacon, cheddar, crispy onion, BBQ sauce and ranch.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902914/ckonb37wjp254nerizvq.jpg', 'BBQ Bacon Ranch Burger', 0, 17.50, 4.70, 0, 'BBQ,Crowd favorite', 0, 'FC-000040', 3, 17.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(41, 'burgers', 'Grilled veggie patty, avocado, lettuce, tomato and herb aioli.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903365/cxyrjxgm9jdzv4aclptt.jpg', 'Green Garden Burger', 0, 14.50, 4.60, 0, 'Vegetarian,Fresh', 1, 'FC-000041', 3, 14.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(42, 'sides', 'Crispy fries with beef chili, cheddar sauce, jalapeño and sour cream.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903737/qivwgwzoo2bazpixa9hv.jpg', 'Chili Cheese Fries', 1, 11.00, 4.80, 1, 'Spicy,Loaded', 0, 'FC-000042', 4, 11.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(43, 'sides', 'Crispy fries tossed with parmesan, rosemary, parsley and garlic butter.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787147112/u2bz3yoksn4j9pdctglt.jpg', 'Herb Parmesan Fries', 0, 8.00, 4.70, 0, 'Vegetarian,Classic', 1, 'FC-000043', 4, 8.00, 1, '2026-08-16 19:22:51', '2026-08-19 13:45:14'),
(44, 'sides', 'Crispy jalapeños filled with cream cheese and cheddar, with ranch dip.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787147087/yorwdiou16odgqohsa9t.jpg', 'Jalapeno Poppers', 0, 9.00, 4.70, 1, 'Spicy,Shareable', 1, 'FC-000044', 4, 9.00, 1, '2026-08-16 19:22:51', '2026-08-19 13:44:49'),
(45, 'sides', 'Romaine, parmesan, sourdough croutons and creamy Caesar dressing.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787147065/ztsia9mbrjtqxpwhz4yx.jpg', 'Classic Caesar Salad', 0, 9.50, 4.50, 0, 'Fresh,Vegetarian', 1, 'FC-000045', 4, 9.50, 1, '2026-08-16 19:22:51', '2026-08-19 13:44:27'),
(46, 'sides', 'Warm toasted bread with garlic herb butter, parmesan and marinara.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787147039/fbcjvhf6jp24lhsqojn8.jpg', 'Garlic Bread', 0, 6.00, 4.60, 0, 'Vegetarian,Classic', 1, 'FC-000046', 4, 6.00, 1, '2026-08-16 19:22:51', '2026-08-19 13:44:02'),
(47, 'pizza', 'Signature pizza with bubbling mozzarella, roasted tomatoes, basil and extra virgin olive oil.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787146675/ev17wpccm9khpjtdjxmi.jpg', 'Wood-fired Special', 1, 21.50, 4.90, 0, 'New,Wood-fired', 1, 'FC-000047', 1, 21.50, 1, '2026-08-16 19:22:51', '2026-08-19 13:37:58'),
(48, 'burgers', 'Juicy double smash burger with cheddar, lettuce, tomato, pickles and house sauce.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903664/rxskdcuxcwp9tkmfgqix.jpg', 'Classic Smash Supreme', 1, 18.50, 4.90, 0, 'New,Bestseller', 0, 'FC-000048', 3, 18.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(49, 'sides', 'Crispy golden fries topped with cheese sauce, herbs and our smoky house drizzle.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903650/gddu0qjvand4dbkf44qe.jpg', 'Golden Loaded Fries', 1, 10.50, 4.80, 0, 'New,Shareable', 0, 'FC-000049', 4, 10.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(50, 'sides', 'Fresh greens, tomato, cucumber, avocado, seeds and citrus herb dressing.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786902366/me3gwi8ltmasmqf8zebs.webp', 'Garden Crunch Salad', 0, 11.00, 4.70, 0, 'New,Fresh', 1, 'FC-000050', 4, 11.00, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(51, 'pizza-bagels', 'Toasted mini pizza bagels with bubbling cheese, tomato sauce and Italian herbs.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1786903638/rwm2iosknklxh1zstm8r.webp', 'Cheesy Pizza Bagel Platter', 1, 11.50, 4.80, 0, 'New,Shareable', 0, 'FC-000051', 2, 11.50, 1, '2026-08-16 19:22:51', '2026-08-16 19:58:05'),
(52, 'sides', 'Roasted seasonal vegetables, herbs, parmesan and warm toasted sourdough.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787147014/thdgeyelhw5soyogmzod.webp', 'Firehouse Veggie Plate', 0, 12.00, 4.70, 0, 'New,Vegetarian', 1, 'FC-000052', 4, 12.00, 1, '2026-08-16 19:22:51', '2026-08-19 13:43:36'),
(53, 'sides', 'A generous mix of our favorite bites, sauces and freshly baked sides for sharing.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787146983/vfscaqereswc0cg5cge3.jpg', 'Chef\'s Sharing Box', 1, 24.00, 4.90, 0, 'New,Shareable', 0, 'FC-000053', 4, 24.00, 1, '2026-08-16 19:22:51', '2026-08-19 13:43:09'),
(54, 'drink', 'Cold-brewed artisan coffee topped with sweet condensed milk over ice.', 'https://res.cloudinary.com/gdkctwwo/image/upload/v1787375944/wpl9rtxumykquc2c7ot4.webp', 'Iced Milk Coffee', 0, 2.50, 4.70, 0, 'New,Fresh,Drinks', 1, 'FC-000054', 5, 2.50, 1, '2026-08-22 05:19:13', '2026-08-22 05:19:13');

-- 8. Add Pizza and Burger Size Options & Variants for all products
INSERT IGNORE INTO `product_options` (`id`, `product_id`, `name`, `is_required`) VALUES
(1, 1, 'Size', 1),
(2, 2, 'Size', 1),
(3, 4, 'Size', 1),
(4, 6, 'Size', 1),
(5, 7, 'Size', 1),
(6, 8, 'Size', 1),
(7, 10, 'Size', 1),
(8, 12, 'Size', 1),
(9, 16, 'Size', 1),
(10, 18, 'Size', 1),
(11, 23, 'Size', 1),
(12, 25, 'Size', 1),
(13, 29, 'Size', 1),
(14, 32, 'Size', 1),
(15, 38, 'Size', 1);

INSERT IGNORE INTO `product_variants` (`id`, `option_id`, `name`, `price_adjustment`, `active`) VALUES
(1, 1, 'Personal 10"', 0.00, 1),
(2, 1, 'Medium 12"', 2.50, 1),
(3, 1, 'Large 14"', 4.50, 1),
(4, 2, 'Personal 10"', 0.00, 1),
(5, 2, 'Medium 12"', 2.50, 1),
(6, 2, 'Large 14"', 4.50, 1),
(7, 3, 'Single Patty', 0.00, 1),
(8, 3, 'Double Patty (+ $2)', 2.00, 1),
(9, 4, 'Personal 10"', 0.00, 1),
(10, 4, 'Medium 12"', 2.50, 1),
(11, 4, 'Large 14"', 4.50, 1),
(12, 5, 'Personal 10"', 0.00, 1),
(13, 5, 'Medium 12"', 2.50, 1),
(14, 5, 'Large 14"', 4.50, 1),
(15, 6, 'Single Bagel', 0.00, 1),
(16, 6, 'Double Bagel (+ $3)', 3.00, 1),
(17, 7, 'Single Patty', 0.00, 1),
(18, 7, 'Double Patty (+ $2)', 2.00, 1),
(19, 8, 'Single Stack', 0.00, 1),
(20, 8, 'Triple Stack (+ $4)', 4.00, 1),
(21, 9, 'Personal 10"', 0.00, 1),
(22, 9, 'Medium 12"', 2.50, 1),
(23, 9, 'Large 14"', 4.50, 1),
(24, 10, 'Personal 10"', 0.00, 1),
(25, 10, 'Medium 12"', 2.50, 1),
(26, 10, 'Large 14"', 4.50, 1),
(27, 11, 'Regular Bun', 0.00, 1),
(28, 11, 'Brioche Combo (+ $1.50)', 1.50, 1),
(29, 12, 'Single Patty', 0.00, 1),
(30, 12, 'Double Patty (+ $2)', 2.00, 1),
(31, 13, 'Personal 10"', 0.00, 1),
(32, 13, 'Medium 12"', 2.50, 1),
(33, 13, 'Large 14"', 4.50, 1),
(34, 14, 'Personal 10"', 0.00, 1),
(35, 14, 'Medium 12"', 2.50, 1),
(36, 14, 'Large 14"', 4.50, 1),
(37, 15, 'Single Patty', 0.00, 1),
(38, 15, 'Double Patty (+ $2)', 2.00, 1);

SET FOREIGN_KEY_CHECKS = 1;
