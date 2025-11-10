-- Fix UUID and timestamp defaults for all tables
-- Run this in Supabase Dashboard -> SQL Editor

-- Items table
ALTER TABLE items 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Users table
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Stores table
ALTER TABLE stores 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Orders table
ALTER TABLE orders 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Order Items table
ALTER TABLE order_items 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Cart Items table
ALTER TABLE cart_items 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN added_at SET DEFAULT now();

-- Transactions table
ALTER TABLE transactions 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Payouts table
ALTER TABLE payouts 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Analytics table
ALTER TABLE analytics 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- Dropoff Slots table
ALTER TABLE dropoff_slots 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Admins table
ALTER TABLE admins 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Store Staff table
ALTER TABLE store_staff 
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN created_at SET DEFAULT now();

-- Create trigger to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to items table
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to stores table
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to payouts table
DROP TRIGGER IF EXISTS update_payouts_updated_at ON payouts;
CREATE TRIGGER update_payouts_updated_at
    BEFORE UPDATE ON payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
