-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: flame_crust
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `flame_crust`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `flame_crust` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `flame_crust`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `label` varchar(50) DEFAULT 'Home',
  `address_line` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_customer` (`customer_id`),
  CONSTRAINT `fk_addresses_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` (`id`, `customer_id`, `label`, `address_line`, `city`, `postal_code`, `notes`, `is_default`, `created_at`) VALUES (1,3,'Delivery','Independence Monument, Independence Monument Roundabout, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, 120102, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 13:56:23'),(2,3,'Delivery','Cellcard office, Samdech Preah Sihanouk Boulevard (Street 274), Sangkat Boeng Reang, Khan Daun Penh, Phnom Penh, 120204, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 14:06:06'),(3,3,'Delivery','Independence Monument, Independence Monument Roundabout, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, 120102, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 14:32:42'),(4,3,'Delivery','Wat Langkar (Street 55), Sangkat Boeng Reang, Khan Daun Penh, Phnom Penh, 120204, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 14:36:31'),(5,3,'1','Community (TK31), Sangkat Boeung Salang, Khan Toul Kork, Phnom Penh, 120410, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 14:46:12'),(6,2,'Delivery','Community (TK31), Sangkat Boeung Salang, Khan Toul Kork, Phnom Penh, 120410, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 15:16:19'),(7,2,'Delivery','Community (TK31), Sangkat Boeung Salang, Khan Toul Kork, Phnom Penh, 120410, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-19 15:46:04'),(8,1,'Delivery','Independence Monument, Independence Monument Roundabout, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, 120102, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-20 04:24:08'),(9,2,'Delivery','Street 218, Community (TK31), Sangkat Teuk L\'ak Ti Bei, Khan Toul Kork, Phnom Penh, 120410, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-20 04:36:12'),(10,2,'1','ផ្លូវវង្សគុតបូរី, Phum Phsar Teuk Thla, Sangkat Teuk Thla, Khan Sen Sok, Phnom Penh, 120802, Cambodia','Phnom Penh',NULL,NULL,0,'2026-08-20 04:37:15'),(11,5,'Delivery','The Plaza Street, Sangkat Veal Vong, Khan Prampir Makara, Phnom Penh, 120307, Cambodia','Phnom Penh',NULL,NULL,1,'2026-08-21 09:08:20');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_created` (`user_id`,`created_at`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `options` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cart_items_cart` (`cart_id`),
  KEY `fk_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `chk_cart_items_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_carts_customer` (`customer_id`),
  CONSTRAINT `fk_carts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  CONSTRAINT `chk_categories_sort_order` CHECK ((`sort_order` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `slug`, `name`, `sort_order`, `active`) VALUES (1,'pizza','Pizza',1,1),(2,'pizza-bagels','Pizza Bagels',2,1),(3,'burgers','Burgers',3,1),(4,'sides','Sides',4,1),(26,'Drink','Drink',5,1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `expires_at` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupons_code` (`code`),
  CONSTRAINT `chk_coupons_type` CHECK ((`discount_type` in (_utf8mb4'PERCENTAGE',_utf8mb4'FIXED',_utf8mb4'FREE_DELIVERY'))),
  CONSTRAINT `chk_coupons_values` CHECK (((`discount_value` >= 0) and (`min_order_amount` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `expires_at`, `active`) VALUES (1,'FREEDELIVERY','FREE_DELIVERY',20.00,29.00,NULL,1),(2,'NEWUSER1','FREE_DELIVERY',0.00,0.00,NULL,1),(3,'NEWUSER2','FREE_DELIVERY',0.00,0.00,NULL,1);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(180) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `password_hash` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customers_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `created_at`, `updated_at`, `password_hash`, `status`, `deleted_at`) VALUES (1,'Guest Customer','guest@flamecrust.com','0123456789','2026-08-16 19:22:51','2026-08-16 19:22:51',NULL,'ACTIVE',NULL),(2,'chanthakhemara','chanthakhemara@gmail.com',NULL,'2026-08-19 12:44:41','2026-08-19 12:44:41',NULL,'ACTIVE',NULL),(3,'kaosokleng415','kaosokleng415@gmail.com',NULL,'2026-08-19 13:55:13','2026-08-19 13:55:13',NULL,'ACTIVE',NULL),(4,'kariulk8','kariulk8@gmail.com',NULL,'2026-08-20 04:55:47','2026-08-20 04:55:47',NULL,'ACTIVE',NULL),(5,'Chantha Khemara (Kanekira)','chanthakhemara12@gmail.com',NULL,'2026-08-21 09:06:55','2026-08-21 09:06:55',NULL,'ACTIVE',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `vehicle_info` varchar(255) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'OFFLINE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_drivers_phone` (`phone`),
  CONSTRAINT `chk_drivers_status` CHECK ((`status` in (_utf8mb4'ONLINE',_utf8mb4'BUSY',_utf8mb4'OFFLINE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `options` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `line_total`, `product_name`, `options`) VALUES (1,1,22,4,7.00,28.00,'Garlic Butter Bagel Bites',NULL),(2,2,3,1,7.50,7.50,'Classic Pizza Bagel',NULL),(3,2,8,1,9.00,9.00,'Pepperoni Pizza Bagel',NULL),(4,2,9,1,8.50,8.50,'Four Cheese Pizza Bagel',NULL),(5,3,3,2,7.50,15.00,'Classic Pizza Bagel',NULL),(6,3,4,2,16.00,32.00,'Flame & Crust Signature',NULL),(7,4,2,4,19.00,76.00,'Pepperoni Diavola',NULL),(8,5,33,1,21.00,21.00,'Applewood BBQ Pizza',NULL),(9,5,47,1,21.50,21.50,'Wood-fired Special',NULL),(10,5,32,1,22.00,22.00,'Meat Lovers Fire',NULL),(11,5,31,1,18.50,18.50,'Pesto Garden',NULL),(12,5,30,8,18.00,144.00,'Roasted Garlic Bianca',NULL),(13,5,29,1,19.50,19.50,'Honey Pepperoni',NULL),(14,6,1,2,16.50,33.00,'Margherita Classica',NULL),(15,6,4,1,16.00,16.00,'Flame & Crust Signature',NULL),(16,6,6,1,21.00,21.00,'Quattro Formaggi',NULL),(17,6,5,1,8.00,8.00,'Truffle Parm Fries',NULL),(18,6,7,2,18.50,37.00,'Nonna\'s Garden',NULL),(19,7,1,1,16.50,16.50,'Margherita Classica',NULL),(20,7,2,7,19.00,133.00,'Pepperoni Diavola',NULL),(21,8,8,3,9.00,27.00,'Pepperoni Pizza Bagel','{}'),(22,9,53,1,24.00,24.00,'Chef\'s Sharing Box',NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(30) NOT NULL,
  `customer_id` bigint NOT NULL,
  `address_id` bigint DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notes` varchar(500) DEFAULT NULL,
  `idempotency_key` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `coupon_id` bigint DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orders_number` (`order_number`),
  UNIQUE KEY `uk_orders_idempotency` (`idempotency_key`),
  KEY `idx_orders_customer` (`customer_id`),
  KEY `idx_orders_status` (`status`),
  KEY `fk_orders_address` (`address_id`),
  CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `status` varchar(30) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_status_history_order` (`order_id`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

DELIMITER //
CREATE TRIGGER trg_orders_status_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO order_status_history (order_id, status) VALUES (NEW.id, NEW.status);
END //

CREATE TRIGGER trg_orders_status_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO order_status_history (order_id, status) VALUES (NEW.id, NEW.status);
    END IF;
END //
DELIMITER ;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id`, `order_number`, `customer_id`, `address_id`, `status`, `subtotal`, `delivery_fee`, `total`, `notes`, `created_at`, `updated_at`, `coupon_id`, `driver_id`, `discount_amount`) VALUES (1,'ORD-563550',3,1,'PENDING',28.00,0.99,28.99,'Payment: KHQR','2026-08-19 13:56:23','2026-08-19 13:56:23',NULL,NULL,0.00),(2,'ORD-262450',3,2,'PENDING',25.00,0.99,25.99,'Payment: KHQR','2026-08-19 14:06:06','2026-08-19 14:06:06',2,NULL,0.00),(3,'ORD-464139',3,3,'PENDING',47.00,0.99,47.99,'Payment: KHQR','2026-08-19 14:32:43','2026-08-19 14:32:43',1,NULL,0.00),(4,'ORD-789760',3,4,'PENDING',76.00,0.99,76.99,'Payment: CASH','2026-08-19 14:36:31','2026-08-19 14:36:31',1,NULL,0.00),(5,'ORD-714664',2,6,'PENDING',246.50,0.99,247.49,'Payment: KHQR','2026-08-19 15:16:20','2026-08-19 15:16:20',1,NULL,0.00),(6,'ORD-782923',2,7,'DELIVERED',115.00,0.99,115.99,'Payment: KHQR','2026-08-19 15:46:05','2026-08-21 09:44:05',1,NULL,0.00),(7,'ORD-509932',1,8,'PENDING',149.50,0.99,150.49,'Payment: KHQR','2026-08-20 04:24:09','2026-08-20 04:24:09',2,NULL,0.00),(8,'ORD-553518',2,9,'PENDING',27.00,4.98,31.98,'Payment: KHQR','2026-08-20 04:36:13','2026-08-20 04:36:13',1,NULL,0.00),(9,'ORD-587803',5,11,'PENDING',24.00,0.99,24.99,'Payment: CASH','2026-08-21 09:08:20','2026-08-21 09:08:20',3,NULL,0.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `target` varchar(180) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_otps_target_expires` (`target`,`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
INSERT INTO `otps` (`id`, `target`, `otp_code`, `is_used`, `expires_at`) VALUES (1,'chanthakhemara8@gmail.com','081957',0,'2026-08-16 19:27:56'),(2,'chanthakhemara8@gmail.com','279944',0,'2026-08-16 19:28:14'),(3,'chanthakhemara8@gmail.com','999839',0,'2026-08-16 19:28:23'),(4,'chanthakhemara8@gmail.com','018311',0,'2026-08-16 19:28:36'),(5,'chanthakhemara8@gmail.com','549880',0,'2026-08-16 19:28:49'),(6,'chanthakhemara@gmail.com','323589',1,'2026-08-19 12:49:13'),(7,'chanthakhemara@gmail.com','252392',1,'2026-08-19 12:59:23'),(8,'chanthakhemara@gmail.com','257211',1,'2026-08-19 13:33:16'),(9,'kaosokleng415@gmail.com','975764',1,'2026-08-19 13:58:22'),(10,'chanthakhemara@gmail.com','959321',1,'2026-08-19 15:14:49'),(11,'chanthakhemara@gmail.com','937021',1,'2026-08-19 15:18:48'),(12,'chanthakhemara@gmail.com','898426',1,'2026-08-20 04:38:29'),(13,'kariulk8@gmail.com','538863',1,'2026-08-20 05:00:13');
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `method` varchar(30) NOT NULL DEFAULT 'CASH',
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `amount` decimal(10,2) NOT NULL,
  `transaction_id` varchar(120) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order` (`order_id`),
  UNIQUE KEY `uk_payments_transaction` (`transaction_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_attempts`
--

DROP TABLE IF EXISTS `payment_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `method` varchar(30) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `amount` decimal(10,2) NOT NULL,
  `transaction_id` varchar(120) DEFAULT NULL,
  `error_message` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_attempts_order` (`order_id`),
  CONSTRAINT `fk_payment_attempts_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` (`id`, `order_id`, `method`, `status`, `amount`, `transaction_id`, `paid_at`, `created_at`) VALUES (1,1,'OTHER','PAID',28.99,'TXN-1787147784628',NULL,'2026-08-19 13:56:24'),(2,2,'OTHER','PAID',25.99,'TXN-1787148368118',NULL,'2026-08-19 14:06:08'),(3,3,'OTHER','PAID',47.99,'TXN-1787149964122',NULL,'2026-08-19 14:32:44'),(4,4,'CASH','PENDING',76.99,NULL,NULL,'2026-08-19 14:36:32'),(5,5,'OTHER','PAID',247.49,'TXN-1787152581432',NULL,'2026-08-19 15:16:21'),(6,6,'OTHER','PAID',115.99,'TXN-1787154367095',NULL,'2026-08-19 15:46:07'),(7,7,'OTHER','PAID',150.49,'TXN-1787199850379',NULL,'2026-08-20 04:24:10'),(8,8,'OTHER','PAID',31.98,'TXN-1787200574251',NULL,'2026-08-20 04:36:14'),(9,9,'CASH','PENDING',24.99,NULL,NULL,'2026-08-21 09:08:20');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_options`
--

DROP TABLE IF EXISTS `product_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_product_options_product` (`product_id`),
  CONSTRAINT `fk_product_options_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_options`
--

LOCK TABLES `product_options` WRITE;
/*!40000 ALTER TABLE `product_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `option_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `price_adjustment` decimal(10,2) NOT NULL DEFAULT '0.00',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_product_variants_option` (`option_id`),
  CONSTRAINT `fk_product_variants_option` FOREIGN KEY (`option_id`) REFERENCES `product_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `popular` bit(1) NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `rating` decimal(38,2) DEFAULT NULL,
  `spicy` bit(1) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `vegetarian` bit(1) NOT NULL,
  `sku` varchar(40) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (`id`, `category`, `description`, `image`, `name`, `popular`, `price`, `rating`, `spicy`, `tags`, `vegetarian`, `sku`, `category_id`, `base_price`, `active`, `created_at`, `updated_at`) VALUES (1,'pizza','San Marzano tomato, fresh mozzarella and basil on a fermented sourdough crust.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786900587/t82rlj2ukaaj4ofxmvq7.webp','Margherita Classica',_binary '',16.50,4.90,_binary '\0','Bestseller,Wood-fired',_binary '','FC-000001',1,16.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(2,'pizza','Spicy cup-and-char pepperoni, double mozzarella and chili honey.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786900619/ca4ywsennatswbxortvs.jpg','Pepperoni Diavola',_binary '',19.00,4.80,_binary '','Spicy,Crowd favorite',_binary '\0','FC-000002',1,19.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(3,'pizza-bagels','Toasted everything bagel with tomato sauce, mozzarella and oregano.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902178/z9fkkk483s3g2azbara9.jpg','Classic Pizza Bagel',_binary '',7.50,4.90,_binary '\0','Bestseller,Quick bite',_binary '','FC-000003',2,7.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(4,'burgers','Double smashed Angus patties, cheddar, caramelized onions and bacon jam.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902752/uhvwpiolqyqt6gv5rsgl.jpg','Flame & Crust Signature',_binary '',16.00,4.90,_binary '\0','Bestseller,Double patty',_binary '\0','FC-000004',3,16.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(5,'sides','Hand-cut fries with truffle oil, parmesan and garlic aioli.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903252/bgq12fdgpdn3kqlftt2q.webp','Truffle Parm Fries',_binary '',8.00,4.90,_binary '\0','Bestseller,Vegetarian',_binary '','FC-000005',4,8.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(6,'pizza','Mozzarella, gorgonzola, fontina and parmesan with walnuts and truffle honey.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787146639/y0vaxiewxcwfmaz6khr5.jpg','Quattro Formaggi',_binary '\0',21.00,4.70,_binary '\0','Premium,Vegetarian',_binary '','FC-000006',1,21.00,1,'2026-08-16 19:22:50','2026-08-19 13:37:23'),(7,'pizza','Roasted peppers, caramelized onions, mushrooms, olives, arugula and balsamic reduction.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786900504/tesx8mayykb21wcp1qy6.jpg','Nonna\'s Garden',_binary '\0',18.50,4.60,_binary '\0','Vegetarian,Seasonal',_binary '','FC-000007',1,18.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(8,'pizza-bagels','Hand-rolled bagel with tomato sauce, double cheese and crisp pepperoni cups.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902194/kn0pub6ugqfsd1af6446.jpg','Pepperoni Pizza Bagel',_binary '',9.00,4.80,_binary '\0','Fan favorite',_binary '\0','FC-000008',2,9.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(9,'pizza-bagels','Mozzarella, cheddar, parmesan and gorgonzola over a sourdough bagel with garlic butter.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902208/e9bno23c1azn6z6lcarg.jpg','Four Cheese Pizza Bagel',_binary '\0',8.50,4.70,_binary '\0','Vegetarian,Cheesy',_binary '','FC-000009',2,8.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(10,'burgers','Angus patty, crispy bacon, gorgonzola, mushrooms, arugula and balsamic glaze.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902771/ovl27xji0e4s67s8ipa6.jpg','Bacon Blue Deluxe',_binary '',17.50,4.80,_binary '\0','Premium,Bold flavor',_binary '\0','FC-000010',3,17.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(11,'burgers','Angus patty, American cheese, lettuce, tomato, onion and secret sauce.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902786/fktpgqdz6lllupjemaus.jpg','Classic Cheeseburger',_binary '\0',12.00,4.70,_binary '\0','Classic,Family pick',_binary '\0','FC-000011',3,12.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(12,'burgers','Triple Angus, double bacon, cheddar, onion rings, BBQ sauce and jalapeño.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902806/pldrcz8xcczd3wh1prt4.jpg','Smokehouse Stack',_binary '\0',19.50,4.80,_binary '','Spicy,Triple stack',_binary '\0','FC-000012',3,19.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(13,'sides','Eight jumbo wings with house buffalo sauce, vegetables and blue cheese dip.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903276/ymwv0ej7mhgefrqra6so.jpg','Buffalo Wings',_binary '\0',12.50,4.80,_binary '','Spicy,Game day',_binary '\0','FC-000013',4,12.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(14,'sides','Six pillowy garlic knots brushed with herb butter and served with marinara dip.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903295/r5x7ipznucl9k4h0qjua.jpg','Garlic Knots',_binary '\0',6.50,4.70,_binary '\0','Vegetarian,Shareable',_binary '','FC-000014',4,6.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(15,'sides','Sweet onions in buttermilk batter, golden-fried with chipotle ranch dip.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903307/hig28s2moq1zrjlhjkxr.jpg','Crispy Onion Rings',_binary '\0',7.00,4.60,_binary '\0','Vegetarian,Crispy',_binary '','FC-000015',4,7.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(16,'pizza','Calabrese salami, roasted peppers, mozzarella, chili oil and fresh basil.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901536/w46kcma68y9y1lhgzd7j.jpg','Spicy Calabrese',_binary '',20.00,4.80,_binary '','Spicy,Wood-fired',_binary '\0','FC-000016',1,20.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(17,'pizza','Prosciutto, mozzarella, parmesan, rocket and lemon olive oil on sourdough.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901552/cinwemvxdvycgau11emj.jpg','Prosciutto Verde',_binary '\0',22.00,4.80,_binary '\0','Premium,Fresh',_binary '\0','FC-000017',1,22.00,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(18,'pizza','Roasted chicken, smoked mozzarella, red onion, sweet corn and smoky BBQ glaze.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901568/edrhocyktzgc2qf85ea3.jpg','BBQ Chicken Pizza',_binary '',19.50,4.70,_binary '\0','Crowd favorite,BBQ',_binary '\0','FC-000018',1,19.50,1,'2026-08-16 19:22:50','2026-08-16 19:56:03'),(19,'pizza','Wild mushrooms, mozzarella, garlic cream, thyme and truffle oil.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901583/plgjcvriwz3m0qfhqjqx.jpg','Mushroom Truffle Pizza',_binary '\0',20.50,4.80,_binary '\0','Vegetarian,Premium',_binary '','FC-000019',1,20.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(20,'pizza-bagels','Everything bagel, cheddar, scrambled egg, crispy bacon and tomato relish.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902224/ggcoyusnvq250kxykggz.jpg','Breakfast Pizza Bagel',_binary '\0',10.50,4.60,_binary '\0','Breakfast,Quick bite',_binary '\0','FC-000020',2,10.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(21,'pizza-bagels','Toasted bagel with cream cheese, mozzarella, jalapeño and crispy crumbs.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902239/iw524a8kjmz345qxfrat.jpg','Jalapeno Popper Bagel',_binary '\0',9.50,4.70,_binary '','Spicy,Cheesy',_binary '','FC-000021',2,9.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(22,'pizza-bagels','Mini sourdough bagels with garlic butter, parmesan and parsley.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902254/l77uqplkte4m109dytjt.jpg','Garlic Butter Bagel Bites',_binary '\0',7.00,4.60,_binary '\0','Vegetarian,Shareable',_binary '','FC-000022',2,7.00,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(23,'burgers','Crispy chicken, slaw, pickles, hot honey and house mayo on a toasted bun.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902822/deut9kz9xjczsrfjuhxb.jpg','Crispy Chicken Burger',_binary '',15.50,4.80,_binary '','Spicy,Crowd favorite',_binary '\0','FC-000023',3,15.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(24,'burgers','Angus patty, Swiss cheese, roasted mushrooms, crispy onions and garlic aioli.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902835/vmbpgbwzfy4epvkbnnxc.jpg','Mushroom Swiss Burger',_binary '\0',16.50,4.70,_binary '\0','Vegetarian option,Premium',_binary '\0','FC-000024',3,16.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(25,'burgers','Double Angus patties, pepper jack, jalapeño relish, crispy onions and hot sauce.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902848/kvnqnzhn3qdsnkcxntbk.jpg','Firecracker Burger',_binary '',18.50,4.80,_binary '','Spicy,Double patty',_binary '\0','FC-000025',3,18.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(26,'sides','Crispy fries topped with cheddar sauce, bacon, spring onion and ranch.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903321/unhnnj5zegmirpwpsqje.jpg','Loaded Cheese Fries',_binary '',10.00,4.80,_binary '\0','Crowd favorite,Shareable',_binary '\0','FC-000026',4,10.00,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(27,'sides','Crispy sweet potato fries served with smoked paprika aioli.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903334/zvcakd7xbckgrabiwjoh.jpg','Sweet Potato Fries',_binary '\0',8.50,4.60,_binary '\0','Vegetarian,Crispy',_binary '','FC-000027',4,8.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(28,'sides','Golden fried mozzarella sticks with marinara and basil dip.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903349/i8dubv9n4sbqsbi9jhkc.jpg','Mozzarella Sticks',_binary '\0',9.50,4.70,_binary '\0','Vegetarian,Shareable',_binary '','FC-000028',4,9.50,1,'2026-08-16 19:22:50','2026-08-16 19:58:05'),(29,'pizza','Cup-and-char pepperoni, mozzarella, chili flakes and a sweet honey finish.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786855872/pgvufhxnqwxjr8o0pwgr.jpg','Honey Pepperoni',_binary '',19.50,4.90,_binary '','Bestseller,Sweet heat',_binary '\0','FC-000029',1,19.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(30,'pizza','Garlic cream, mozzarella, roasted garlic, parmesan and fresh thyme.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901096/gogieo70g71lilh61fzt.jpg','Roasted Garlic Bianca',_binary '\0',18.00,4.70,_binary '\0','Vegetarian,Garlicky',_binary '','FC-000030',1,18.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(31,'pizza','Basil pesto, mozzarella, cherry tomatoes, zucchini and toasted pine nuts.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901602/axxm9rshosfpqajhekyx.jpg','Pesto Garden',_binary '\0',18.50,4.70,_binary '\0','Vegetarian,Fresh',_binary '','FC-000031',1,18.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(32,'pizza','Pepperoni, sausage, bacon, mozzarella and hot peppers on our sourdough crust.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901617/wihlfw0thkf9qsrnxtcn.jpg','Meat Lovers Fire',_binary '',22.00,4.80,_binary '','Spicy,Loaded',_binary '\0','FC-000032',1,22.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(33,'pizza','Pulled pork, smoked mozzarella, pickled onion and applewood BBQ sauce.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786901633/ccjmk6dedw3hk4t78r0a.jpg','Applewood BBQ Pizza',_binary '\0',21.00,4.60,_binary '\0','BBQ,Premium',_binary '\0','FC-000033',1,21.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(34,'pizza-bagels','Three mini bagels with tomato, mozzarella, basil and olive oil.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902271/gilsiqrktzmlh0ix14t8.jpg','Margherita Mini Bagels',_binary '\0',8.00,4.80,_binary '\0','Vegetarian,Shareable',_binary '','FC-000034',2,8.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(35,'pizza-bagels','Chicken, buffalo sauce, mozzarella, ranch drizzle and celery crunch.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902285/v6zc3jdmrbrjmqvrovor.jpg','Buffalo Chicken Bagel',_binary '\0',10.00,4.70,_binary '','Spicy,Game day',_binary '\0','FC-000035',2,10.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(36,'pizza-bagels','Pepperoni, peppers, onions, mushrooms and mozzarella on mini bagels.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902328/cw1extltuc4crodg0hwb.webp','Supreme Bagel Bites',_binary '',10.50,4.70,_binary '\0','Loaded,Shareable',_binary '\0','FC-000036',2,10.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(37,'pizza-bagels','Spinach, feta, mozzarella, garlic butter and cracked black pepper.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787146709/dejvrwxotdllqe500u4i.jpg','Spinach Feta Bagel',_binary '\0',9.00,4.60,_binary '\0','Vegetarian,Fresh',_binary '','FC-000037',2,9.00,1,'2026-08-16 19:22:51','2026-08-19 13:38:31'),(38,'burgers','Two Angus patties, double bacon, cheddar, pickles and smoky house sauce.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902878/qzruzbrf2pfxpskdu9vm.jpg','Double Bacon Smash',_binary '',18.00,4.90,_binary '\0','Bestseller,Double patty',_binary '\0','FC-000038',3,18.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(39,'burgers','Crispy chicken, pepper jack, slaw, pickles and hot honey glaze.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902895/ejarojzwppq7f7bggysn.jpg','Hot Honey Chicken Burger',_binary '',16.50,4.80,_binary '','Spicy,Hot honey',_binary '\0','FC-000039',3,16.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(40,'burgers','Angus patty, bacon, cheddar, crispy onion, BBQ sauce and ranch.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902914/ckonb37wjp254nerizvq.jpg','BBQ Bacon Ranch Burger',_binary '\0',17.50,4.70,_binary '\0','BBQ,Crowd favorite',_binary '\0','FC-000040',3,17.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(41,'burgers','Grilled veggie patty, avocado, lettuce, tomato and herb aioli.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903365/cxyrjxgm9jdzv4aclptt.jpg','Green Garden Burger',_binary '\0',14.50,4.60,_binary '\0','Vegetarian,Fresh',_binary '','FC-000041',3,14.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(42,'sides','Crispy fries with beef chili, cheddar sauce, jalapeño and sour cream.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903737/qivwgwzoo2bazpixa9hv.jpg','Chili Cheese Fries',_binary '',11.00,4.80,_binary '','Spicy,Loaded',_binary '\0','FC-000042',4,11.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(43,'sides','Crispy fries tossed with parmesan, rosemary, parsley and garlic butter.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787147112/u2bz3yoksn4j9pdctglt.jpg','Herb Parmesan Fries',_binary '\0',8.00,4.70,_binary '\0','Vegetarian,Classic',_binary '','FC-000043',4,8.00,1,'2026-08-16 19:22:51','2026-08-19 13:45:14'),(44,'sides','Crispy jalapeños filled with cream cheese and cheddar, with ranch dip.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787147087/yorwdiou16odgqohsa9t.jpg','Jalapeno Poppers',_binary '\0',9.00,4.70,_binary '','Spicy,Shareable',_binary '','FC-000044',4,9.00,1,'2026-08-16 19:22:51','2026-08-19 13:44:49'),(45,'sides','Romaine, parmesan, sourdough croutons and creamy Caesar dressing.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787147065/ztsia9mbrjtqxpwhz4yx.jpg','Classic Caesar Salad',_binary '\0',9.50,4.50,_binary '\0','Fresh,Vegetarian',_binary '','FC-000045',4,9.50,1,'2026-08-16 19:22:51','2026-08-19 13:44:27'),(46,'sides','Warm toasted bread with garlic herb butter, parmesan and marinara.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787147039/fbcjvhf6jp24lhsqojn8.jpg','Garlic Bread',_binary '\0',6.00,4.60,_binary '\0','Vegetarian,Classic',_binary '','FC-000046',4,6.00,1,'2026-08-16 19:22:51','2026-08-19 13:44:02'),(47,'pizza','Signature pizza with bubbling mozzarella, roasted tomatoes, basil and extra virgin olive oil.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787146675/ev17wpccm9khpjtdjxmi.jpg','Wood-fired Special',_binary '',21.50,4.90,_binary '\0','New,Wood-fired',_binary '','FC-000047',1,21.50,1,'2026-08-16 19:22:51','2026-08-19 13:37:58'),(48,'burgers','Juicy double smash burger with cheddar, lettuce, tomato, pickles and house sauce.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903664/rxskdcuxcwp9tkmfgqix.jpg','Classic Smash Supreme',_binary '',18.50,4.90,_binary '\0','New,Bestseller',_binary '\0','FC-000048',3,18.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(49,'sides','Crispy golden fries topped with cheese sauce, herbs and our smoky house drizzle.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903650/gddu0qjvand4dbkf44qe.jpg','Golden Loaded Fries',_binary '',10.50,4.80,_binary '\0','New,Shareable',_binary '','FC-000049',4,10.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(50,'sides','Fresh greens, tomato, cucumber, avocado, seeds and citrus herb dressing.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786902366/me3gwi8ltmasmqf8zebs.webp','Garden Crunch Salad',_binary '\0',11.00,4.70,_binary '\0','New,Fresh',_binary '','FC-000050',4,11.00,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(51,'pizza-bagels','Toasted mini pizza bagels with bubbling cheese, tomato sauce and Italian herbs.','https://res.cloudinary.com/gdkctwwo/image/upload/v1786903638/rwm2iosknklxh1zstm8r.webp','Cheesy Pizza Bagel Platter',_binary '',11.50,4.80,_binary '\0','New,Shareable',_binary '','FC-000051',2,11.50,1,'2026-08-16 19:22:51','2026-08-16 19:58:05'),(52,'sides','Roasted seasonal vegetables, herbs, parmesan and warm toasted sourdough.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787147014/thdgeyelhw5soyogmzod.webp','Firehouse Veggie Plate',_binary '\0',12.00,4.70,_binary '\0','New,Vegetarian',_binary '','FC-000052',4,12.00,1,'2026-08-16 19:22:51','2026-08-19 13:43:36'),(53,'sides','A generous mix of our favorite bites, sauces and freshly baked sides for sharing.','https://res.cloudinary.com/gdkctwwo/image/upload/v1787146983/vfscaqereswc0cg5cge3.jpg','Chef\'s Sharing Box',_binary '',24.00,4.90,_binary '\0','New,Shareable',_binary '\0','FC-000053',4,24.00,1,'2026-08-16 19:22:51','2026-08-19 13:43:09'),(54,'Drink','','https://res.cloudinary.com/gdkctwwo/image/upload/v1787375944/wpl9rtxumykquc2c7ot4.webp','Iced Milk Coffee',_binary '\0',2.50,4.70,_binary '\0','New,Fresh',_binary '\0',NULL,NULL,NULL,1,'2026-08-22 05:19:13','2026-08-22 05:19:13');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reviews_product_customer` (`product_id`,`customer_id`),
  KEY `fk_reviews_customer` (`customer_id`),
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `permissions` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`id`, `name`, `permissions`) VALUES (1,'Admin','{\"can_delete\": true, \"can_manage_users\": true}'),(2,'Manager','{\"can_delete\": false, \"can_manage_users\": false}'),(3,'Staff','{\"can_delete\": false, \"can_manage_users\": false}');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `chk_users_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'SUSPENDED')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `password_hash`, `status`, `created_at`, `deleted_at`) VALUES (1,1,'Admin','admin@flamecrust.com','$2a$10$Zy5pdLN1kPVsp1cUiTAqcuEjlxu2maJrQbH/cYjAO.0RfAx2Gkzya','ACTIVE','2026-08-16 19:22:51',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-22  5:35:08
