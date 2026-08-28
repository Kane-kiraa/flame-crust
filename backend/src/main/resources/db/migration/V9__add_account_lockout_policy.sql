-- Migration V9: Add Account Lockout Policy Columns to prevent Brute-Force attacks
-- Failed attempts counter and lock expiration timestamp for all authenticable entities

ALTER TABLE customers ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;

ALTER TABLE kitchen_staff ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE kitchen_staff ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;
