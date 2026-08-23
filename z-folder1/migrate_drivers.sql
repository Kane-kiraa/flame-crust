-- ============================================
-- Migration: Enhance drivers table for email login,
-- profile completion, and real-time location
-- ============================================

ALTER TABLE `drivers`
  ADD COLUMN `email` VARCHAR(180) NULL UNIQUE AFTER `phone`,
  ADD COLUMN `password_hash` VARCHAR(255) NULL AFTER `email`,
  ADD COLUMN `profile_photo` VARCHAR(255) NULL AFTER `password_hash`,
  ADD COLUMN `date_of_birth` DATE NULL AFTER `profile_photo`,
  ADD COLUMN `national_id` VARCHAR(50) NULL AFTER `date_of_birth`,
  ADD COLUMN `address` VARCHAR(255) NULL AFTER `national_id`,
  ADD COLUMN `emergency_contact` VARCHAR(30) NULL AFTER `address`,
  ADD COLUMN `license_plate` VARCHAR(30) NULL AFTER `emergency_contact`,
  ADD COLUMN `latitude` DECIMAL(10,8) NULL AFTER `license_plate`,
  ADD COLUMN `longitude` DECIMAL(11,8) NULL AFTER `latitude`,
  ADD COLUMN `location_updated_at` TIMESTAMP NULL AFTER `longitude`,
  ADD COLUMN `profile_completed` BOOLEAN NOT NULL DEFAULT FALSE AFTER `location_updated_at`;
