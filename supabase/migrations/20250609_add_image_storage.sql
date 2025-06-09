-- First, create a storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for the storage bucket
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add image_path column to events table
ALTER TABLE public.events
ADD COLUMN image_path TEXT;

-- Migrate existing image URLs to image paths (optional)
-- This assumes you want to keep the URLs as paths for now
UPDATE public.events
SET image_path = image_url
WHERE image_url IS NOT NULL;

-- In production, you might want to drop the image_url column later
-- ALTER TABLE public.events DROP COLUMN image_url;