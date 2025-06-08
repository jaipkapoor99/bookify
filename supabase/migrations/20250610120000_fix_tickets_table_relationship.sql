-- Step 1: Drop the incorrect, dangling event_id column if it exists.
ALTER TABLE public.tickets DROP COLUMN IF EXISTS event_id;

-- Step 2: Add the correct column to link to the events_venues table.
-- This column is referenced by the book_ticket function.
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS events_venues_id BIGINT;

-- Step 3: Add the foreign key constraint to establish the relationship.
-- First, drop any old incorrect constraint that might exist.
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS fk_events_venues;

-- Now, add the correct one.
ALTER TABLE public.tickets
ADD CONSTRAINT fk_events_venues
FOREIGN KEY (events_venues_id)
REFERENCES public.events_venues(id)
ON DELETE CASCADE; 