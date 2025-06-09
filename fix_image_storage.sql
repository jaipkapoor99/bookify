-- Fix Image Storage Issues
-- Run this script in your Supabase SQL Editor

-- Step 1: Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add RLS policies for the storage bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Create new policies
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

-- Step 3: Add image_path column to events table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'image_path'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.events ADD COLUMN image_path TEXT;
  END IF;
END $$;

-- Step 4: Migrate existing image URLs to image paths (if needed)
-- This is safe to run multiple times
UPDATE public.events
SET image_path = image_url
WHERE image_url IS NOT NULL 
  AND (image_path IS NULL OR image_path = '');

-- Step 5: Verify the setup
SELECT 
  'Storage Bucket' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'event-images') 
    THEN '✓ Exists' 
    ELSE '✗ Missing' 
  END as status;

SELECT 
  'Events Table image_path Column' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name = 'image_path'
      AND table_schema = 'public'
    ) 
    THEN '✓ Exists' 
    ELSE '✗ Missing' 
  END as status;

SELECT 
  'Storage Policies Count' as component,
  COUNT(*) || ' policies found' as status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%event%';

-- Step 6: Sample query to check events with images
SELECT 
  event_id,
  name,
  CASE 
    WHEN image_path IS NOT NULL THEN 'Has image_path'
    WHEN image_url IS NOT NULL THEN 'Has image_url only'
    ELSE 'No image'
  END as image_status
FROM public.events
ORDER BY event_id
LIMIT 5; 