CREATE TABLE IF NOT EXISTS products (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image VARCHAR(255) NOT NULL,
    tags VARCHAR(255) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    popular BOOLEAN NOT NULL DEFAULT FALSE,
    spicy BOOLEAN NOT NULL DEFAULT FALSE,
    vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    INDEX idx_products_category (category)
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_customers_email (email)
);

CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    label VARCHAR(50) DEFAULT 'Home',
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    notes VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_addresses_customer (customer_id),
    CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_number VARCHAR(30) NOT NULL,
    customer_id BIGINT NOT NULL,
    address_id BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_number (order_number),
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id),
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id)
        REFERENCES addresses (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id)
        REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(120),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_payments_order (order_id),
    UNIQUE KEY uk_payments_transaction (transaction_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE
);
