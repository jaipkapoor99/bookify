-- This migration removes the redundant 'location' column from the 'venues' table,
-- which was added by mistake and violates 3NF. The correct location data
-- is stored in the 'locations' table and linked via 'location_id'.
 
ALTER TABLE public.venues
DROP COLUMN IF EXISTS location; 