-- Step 1: Find your user by email (replace with your actual email)
SELECT id, email, name FROM users WHERE email = 'your-email@example.com';

-- Step 2: Once you have the ID from step 1, use it below
-- Replace 'your-user-id-from-step-1' with the actual ID
INSERT INTO admins (user_id, role) 
VALUES ('your-user-id-from-step-1', 'SUPER')
ON CONFLICT (user_id) DO UPDATE SET role = 'SUPER';

-- Step 3: Verify you're now an admin
SELECT a.*, u.email, u.name 
FROM admins a 
JOIN users u ON u.id = a.user_id;
