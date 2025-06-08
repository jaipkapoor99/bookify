-- Step 1: Add venue_id to events table
ALTER TABLE public.events
ADD COLUMN venue_id INTEGER;

-- Step 2: Add a foreign key constraint to venues
ALTER TABLE public.events
ADD CONSTRAINT fk_venue
FOREIGN KEY (venue_id)
REFERENCES public.venues(venue_id);

-- Step 3: Drop the old foreign key on tickets
ALTER TABLE public.tickets
DROP CONSTRAINT IF EXISTS tickets_event_venue_id_fkey;

-- Step 4: Add event_id to tickets table
ALTER TABLE public.tickets
ADD COLUMN event_id INTEGER;

-- Step 5: Add a new foreign key to events
ALTER TABLE public.tickets
ADD CONSTRAINT fk_event
FOREIGN KEY (event_id)
REFERENCES public.events(event_id);

-- Step 6: Remove the now-unused event_venue_id column from tickets
-- Note: You might want to migrate data from event_venue_id to event_id before this step
-- if you have existing ticket data. For this project, we assume it's safe to drop.
ALTER TABLE public.tickets
DROP COLUMN event_venue_id;

-- Step 7: Finally, drop the events_venues table
DROP TABLE IF EXISTS public.events_venues; 