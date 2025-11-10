-- Check if there are any contact messages
SELECT COUNT(*) as message_count FROM contact_messages;

-- Check all contact messages
SELECT * FROM contact_messages ORDER BY created_at DESC;

-- Check if your user is in the admins table
-- Replace 'your-user-id' with your actual auth user ID
SELECT * FROM admins;

-- Check your current auth user ID (run this when logged in)
SELECT auth.uid();

-- If you need to add yourself as an admin, use this:
-- Replace 'your-user-id' with your actual auth user ID from the query above
-- INSERT INTO admins (user_id, role) 
-- VALUES ('your-user-id-here', 'SUPER')
-- ON CONFLICT (user_id) DO NOTHING;
