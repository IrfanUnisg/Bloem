-- Create demo stores for testing
-- Run this in Supabase Dashboard -> SQL Editor AFTER running AUTO_CREATE_USERS.sql

-- First, create demo store owners (one for each store)
INSERT INTO public.users (id, email, name, phone, created_at, updated_at)
VALUES 
  (
    'demo-store-owner-1',
    'owner1@vintagevibes.com',
    'Vintage Vibes Owner',
    '+31 20 123 4567',
    NOW(),
    NOW()
  ),
  (
    'demo-store-owner-2',
    'owner2@retrorevival.com',
    'Retro Revival Owner',
    '+31 20 234 5678',
    NOW(),
    NOW()
  ),
  (
    'demo-store-owner-3',
    'owner3@thrifthaven.com',
    'Thrift Haven Owner',
    '+31 20 345 6789',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert demo stores (each with their own owner)
INSERT INTO public.stores (id, name, email, phone, address, city, description, verified, active, owner_id, created_at, updated_at)
VALUES 
  (
    'store1',
    'Vintage Vibes',
    'contact@vintagevibes.com',
    '+31 20 123 4567',
    'Spuistraat 45',
    'Amsterdam',
    'Curated vintage fashion from the 60s-90s',
    true,
    true,
    'demo-store-owner-1',
    NOW(),
    NOW()
  ),
  (
    'store2',
    'Retro Revival',
    'hello@retrorevival.com',
    '+31 20 234 5678',
    'Utrechtsestraat 12',
    'Amsterdam',
    'Modern secondhand clothing with a retro twist',
    true,
    true,
    'demo-store-owner-2',
    NOW(),
    NOW()
  ),
  (
    'store3',
    'Thrift Haven',
    'info@thrifthaven.com',
    '+31 20 345 6789',
    'Haarlemmerdijk 78',
    'Amsterdam',
    'Your go-to place for affordable quality fashion',
    true,
    true,
    'demo-store-owner-3',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  active = EXCLUDED.active,
  updated_at = NOW();
