/*
# Create Storage Bucket for Image Uploads

1. Storage
- Create a public bucket named 'images' for product, category, banner, blog, and media uploads.
- Allow public read access so the storefront can display uploaded images.
2. Policies
- Allow anyone (anon + authenticated) to READ from the bucket.
- Allow authenticated users to INSERT (upload) files.
- Allow authenticated users to UPDATE and DELETE their own files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for images bucket" ON storage.objects;
CREATE POLICY "Public read access for images bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated upload to images bucket" ON storage.objects;
CREATE POLICY "Authenticated upload to images bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated update own images" ON storage.objects;
CREATE POLICY "Authenticated update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated delete own images" ON storage.objects;
CREATE POLICY "Authenticated delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());
