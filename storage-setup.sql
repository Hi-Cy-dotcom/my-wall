-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to profile images
CREATE POLICY "Public Access Profile Images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload profile images
CREATE POLICY "Upload Profile Images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Update Profile Images"
ON storage.objects
FOR UPDATE
TO public
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to delete their own profile images
CREATE POLICY "Delete Profile Images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'profile-images');
