-- Automatically create users in the public.users table when they sign up
-- Run this in Supabase Dashboard -> SQL Editor

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  store_name TEXT;
  store_address TEXT;
  store_hours TEXT;
  store_owner_name TEXT;
  store_city TEXT;
BEGIN
  -- Extract role from metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'seller');
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- If role is 'store', also create a store record
  IF user_role = 'store' THEN
    store_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    store_address := COALESCE(NEW.raw_user_meta_data->>'address', 'Address not provided');
    store_hours := COALESCE(NEW.raw_user_meta_data->>'hours', 'Mon-Sat: 10am-6pm');
    store_owner_name := COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Owner name not provided');
    
    -- Try to extract city from address (assumes format: "Street, ZIP City")
    -- If address contains a comma, take the part after the last comma
    IF POSITION(',' IN store_address) > 0 THEN
      store_city := TRIM(REGEXP_REPLACE(
        SUBSTRING(store_address FROM POSITION(',' IN store_address) + 1),
        '^[0-9]+\s*',
        ''
      ));
    ELSE
      store_city := 'Not specified';
    END IF;
    
    INSERT INTO public.stores (
      id,
      name,
      email,
      phone,
      address,
      city,
      hours,
      description,
      verified,
      active,
      owner_id,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      store_name,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      store_address,
      store_city,
      store_hours,
      'New store - pending admin verification. Owner: ' || store_owner_name,
      false, -- Not verified by default - needs admin approval
      false, -- Not active until verified
      NEW.id,
      NOW(),
      NOW()
    )
    ON CONFLICT (owner_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also backfill existing auth users who don't have a users table entry
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
  au.id::text,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id::text = au.id::text
)
ON CONFLICT (id) DO NOTHING;
