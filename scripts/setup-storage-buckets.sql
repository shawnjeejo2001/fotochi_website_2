-- Create storage buckets for profile and portfolio pictures
-- Note: This script should be run by a Supabase admin or through the Supabase dashboard

-- Create profile_pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_pictures',
  'profile_pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create portfolio_pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio_pictures',
  'portfolio_pictures',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for profile_pictures bucket
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile_pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile_pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile_pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile_pictures');

-- Set up RLS policies for portfolio_pictures bucket
CREATE POLICY "Users can upload their own portfolio pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio_pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own portfolio pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio_pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own portfolio pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio_pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Portfolio pictures are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio_pictures');
