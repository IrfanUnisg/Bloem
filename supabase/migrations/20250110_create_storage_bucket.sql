-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'items',
  'items',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the items bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'items');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own item images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'items');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'items');

-- Allow public read access to all item images
CREATE POLICY "Public read access for item images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'items');
