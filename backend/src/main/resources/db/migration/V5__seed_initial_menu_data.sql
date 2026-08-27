-- ==============================================================================
-- Flame & Crust Initial Categories & Menu Seeder
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO categories (id, slug, name, sort_order, active) VALUES
(1, 'pizza', 'Pizza', 1, TRUE),
(2, 'pizza-bagels', 'Pizza Bagels', 2, TRUE),
(3, 'burgers', 'Burgers', 3, TRUE),
(4, 'sides', 'Sides', 4, TRUE),
(5, 'drink', 'Drinks', 5, TRUE),
(6, 'chicken', 'Chicken', 6, TRUE),
(7, 'beef', 'Beef', 7, TRUE),
(8, 'cheese', 'Cheese', 8, TRUE),
(9, 'mushroom', 'Mushroom', 9, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order), active=VALUES(active);

-- 2. Insert Products
INSERT INTO products (id, sku, category_id, name, description, price, base_price, category, image, tags, rating, popular, spicy, vegetarian, active) VALUES
(1, 'PIZ-MARG', 1, 'Classic Margherita Pizza', 'Wood-fired sourdough crust, San Marzano tomato sauce, fresh buffalo mozzarella, aromatic basil, and extra virgin olive oil.', 10.99, 10.99, 'pizza', '/images/library/margherita.jpg', 'Signature,Vegetarian,WoodFired', 4.9, TRUE, FALSE, TRUE, TRUE),
(2, 'PIZ-PEPP', 1, 'Pepperoni Supreme Pizza', 'Crispy cupping pepperoni, melted aged mozzarella, rich herb tomato sauce, hot honey drizzle on sourdough crust.', 12.99, 12.99, 'pizza', '/images/library/pepperoni.jpg', 'BestSeller,Spicy,Crispy', 5.0, TRUE, TRUE, FALSE, TRUE),
(3, 'PIZ-BBQ', 1, 'Smoked BBQ Chicken Pizza', 'Tender flame-grilled chicken breast, smoky BBQ sauce, caramelized red onions, sweet corn, and melted smoked gouda.', 13.49, 13.49, 'pizza', '/images/library/bbq-chicken.jpg', 'Smoky,ProteinRich,ChefSpecial', 4.8, TRUE, FALSE, FALSE, TRUE),
(4, 'PIZ-TRUF', 1, 'Truffle Wild Mushroom Pizza', 'Earthy roasted portobello & cremini mushrooms, white truffle cream sauce, fresh thyme, and shaved parmesan.', 14.29, 14.29, 'pizza', '/images/library/truffle-mushroom.jpg', 'Gourmet,Vegetarian,Truffle', 4.9, TRUE, FALSE, TRUE, TRUE),
(5, 'PIZ-MEAT', 1, 'Carnivore Meat Lovers Pizza', 'Handcrafted Italian sausage, crispy bacon bits, savory ground Angus beef, pepperoni, and rich tomato sauce.', 14.99, 14.99, 'pizza', '/images/library/meat-lovers.jpg', 'MeatLovers,Hearty,Savory', 4.9, TRUE, FALSE, FALSE, TRUE),
(6, 'BAG-PEPP', 2, 'Cheesy Pepperoni Pizza Bagel', 'Toasted artisan NYC-style bagel halves topped with garlic butter, marinara, mozzarella, and mini pepperoni crisps.', 6.49, 6.49, 'pizza-bagels', '/images/library/bagel-pep.jpg', 'Snack,Cheesy,Handheld', 4.7, TRUE, FALSE, FALSE, TRUE),
(7, 'BAG-MARG', 2, 'Four-Cheese Garlic Bagel', 'Crispy bagel loaded with parmesan, mozzarella, provolone, fontina, and roasted garlic herb butter.', 5.99, 5.99, 'pizza-bagels', '/images/library/bagel-cheese.jpg', 'Cheesy,Vegetarian,Garlic', 4.8, FALSE, FALSE, TRUE, TRUE),
(8, 'BUR-ANGUS', 3, 'Flame Smashed Double Cheeseburger', 'Two 100% Angus smashed patties, double melted cheddar, grilled onions, house secret burger sauce on toasted brioche.', 9.99, 9.99, 'burgers', '/images/library/burger-angus.jpg', 'Angus,DoublePatty,Juicy', 5.0, TRUE, FALSE, FALSE, TRUE),
(9, 'BUR-TRUF', 3, 'Truffle Swiss Smash Burger', 'Smashed Angus patty, sautéed portobello mushrooms, melted Swiss cheese, and black truffle aioli on brioche.', 11.49, 11.49, 'burgers', '/images/library/burger-truffle.jpg', 'Truffle,Gourmet,Smashed', 4.8, FALSE, FALSE, FALSE, TRUE),
(10, 'SID-WINGS', 4, 'Crispy Garlic Parmesan Wings', 'Juicy bone-in chicken wings tossed in garlic herb butter, grated aged parmesan, served with house ranch.', 7.99, 7.99, 'sides', '/images/library/wings.jpg', 'Crispy,Savory,Wings', 4.9, TRUE, FALSE, FALSE, TRUE),
(11, 'SID-FRIES', 4, 'Loaded Truffle Parmesan Fries', 'Golden crispy fries tossed in rosemary sea salt, truffle oil, grated parmesan, and chives.', 4.99, 4.99, 'sides', '/images/library/fries.jpg', 'Crispy,Truffle,SideFavorite', 4.8, TRUE, FALSE, TRUE, TRUE),
(12, 'DRK-LEMON', 5, 'Fresh Mint Craft Lemonade', 'Freshly squeezed citrus lemonade infused with garden mint and sparkling botanical water.', 3.49, 3.49, 'drink', '/images/library/lemonade.jpg', 'Refreshing,Cold,Citrus', 4.9, TRUE, FALSE, TRUE, TRUE),
(13, 'DRK-COLA', 5, 'Artisan Craft Cane Cola', 'Cold-brewed botanical cane sugar cola served over cracked ice.', 2.99, 2.99, 'drink', '/images/library/cola.jpg', 'Classic,Craft,Cold', 4.7, FALSE, FALSE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), base_price=VALUES(base_price), category=VALUES(category), image=VALUES(image), active=VALUES(active);

-- 3. Add Default 'Size' Options and Variants for Pizza & Burgers
INSERT INTO product_options (id, product_id, name, is_required) VALUES
(1, 1, 'Size', TRUE),
(2, 2, 'Size', TRUE),
(3, 3, 'Size', TRUE),
(4, 4, 'Size', TRUE),
(5, 5, 'Size', TRUE),
(6, 8, 'Size', TRUE),
(7, 9, 'Size', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), is_required=VALUES(is_required);

INSERT INTO product_variants (id, option_id, name, price_adjustment, active) VALUES
(1, 1, 'Personal 10"', 0.00, TRUE),
(2, 1, 'Medium 12"', 2.50, TRUE),
(3, 1, 'Large 14"', 4.50, TRUE),
(4, 2, 'Personal 10"', 0.00, TRUE),
(5, 2, 'Medium 12"', 2.50, TRUE),
(6, 2, 'Large 14"', 4.50, TRUE),
(7, 3, 'Personal 10"', 0.00, TRUE),
(8, 3, 'Medium 12"', 2.50, TRUE),
(9, 3, 'Large 14"', 4.50, TRUE),
(10, 4, 'Personal 10"', 0.00, TRUE),
(11, 4, 'Medium 12"', 2.50, TRUE),
(12, 4, 'Large 14"', 4.50, TRUE),
(13, 5, 'Personal 10"', 0.00, TRUE),
(14, 5, 'Medium 12"', 2.50, TRUE),
(15, 5, 'Large 14"', 4.50, TRUE),
(16, 6, 'Single Patty', 0.00, TRUE),
(17, 6, 'Double Patty (+ $2)', 2.00, TRUE),
(18, 7, 'Single Patty', 0.00, TRUE),
(19, 7, 'Double Patty (+ $2)', 2.00, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), price_adjustment=VALUES(price_adjustment), active=VALUES(active);
