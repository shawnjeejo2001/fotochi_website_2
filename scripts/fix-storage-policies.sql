-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Profile pictures are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own portfolio pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own portfolio pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own portfolio pictures" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio pictures are publicly viewable" ON storage.objects;

-- Create simple, permissive policies for profilepictures bucket
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profilepictures');

CREATE POLICY "Anyone can upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profilepictures');

CREATE POLICY "Anyone can update profile pictures" ON storage.objects
FOR UPDATE USING (bucket_id = 'profilepictures');

CREATE POLICY "Anyone can delete profile pictures" ON storage.objects
FOR DELETE USING (bucket_id = 'profilepictures');

-- Create simple, permissive policies for portfoliopictures bucket
CREATE POLICY "Anyone can view portfolio pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'portfoliopictures');

CREATE POLICY "Anyone can upload portfolio pictures" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'portfoliopictures');

CREATE POLICY "Anyone can update portfolio pictures" ON storage.objects
FOR UPDATE USING (bucket_id = 'portfoliopictures');

CREATE POLICY "Anyone can delete portfolio pictures" ON storage.objects
FOR DELETE USING (bucket_id = 'portfoliopictures');
