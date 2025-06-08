-- This migration enables Row Level Security (RLS) on the core tables
-- and sets up the necessary policies to ensure data privacy and access control.

-- Enable RLS on the venues table
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all venues
DROP POLICY IF EXISTS "Allow public read access" ON public.venues;
CREATE POLICY "Allow public read access"
ON public.venues
FOR SELECT
USING (true);

-- Enable RLS on the events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all events
DROP POLICY IF EXISTS "Allow public read access" ON public.events;
CREATE POLICY "Allow public read access"
ON public.events
FOR SELECT
USING (true);

-- Policy: Allow public read access to the join table
DROP POLICY IF EXISTS "Allow public read access" ON public.events_venues;
CREATE POLICY "Allow public read access"
ON public.events_venues
FOR SELECT
USING (true); 