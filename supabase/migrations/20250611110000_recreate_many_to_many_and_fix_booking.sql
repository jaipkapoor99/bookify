DROP FUNCTION IF EXISTS public.book_ticket(bigint, uuid);
DROP FUNCTION IF EXISTS public.book_ticket(bigint);

-- Step 1: Drop the incorrect, unused columns from the events and tickets tables
ALTER TABLE public.events DROP COLUMN IF EXISTS venue_id;
ALTER TABLE public.tickets DROP COLUMN IF EXISTS event_id;

-- Step 2: Re-create the events_venues table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS public.events_venues (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_id BIGINT NOT NULL,
    venue_id BIGINT NOT NULL,
    no_of_tickets INT,
    event_venue_date DATE,
    CONSTRAINT fk_event
        FOREIGN KEY(event_id)
        REFERENCES public.events(event_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_venue
        FOREIGN KEY(venue_id)
        REFERENCES public.venues(venue_id)
        ON DELETE CASCADE
);

-- Step 3: Add the correct foreign key column back to the tickets table
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS events_venues_id BIGINT;

-- Step 4: Add the foreign key constraint to the tickets table
-- Note: We drop it first in case a previous, incorrect version exists
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS fk_events_venues;
ALTER TABLE public.tickets
ADD CONSTRAINT fk_events_venues
FOREIGN KEY (events_venues_id)
REFERENCES public.events_venues(id)
ON DELETE CASCADE;

-- Step 5: Create the definitive book_ticket function
CREATE OR REPLACE FUNCTION public.book_ticket(p_event_venue_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_venue_details RECORD;
BEGIN
  -- Get the current user's ID from the session
  SELECT auth.uid() INTO v_user_id;

  -- Verify the user exists in the public users table
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User not found in public.users table';
  END IF;

  -- Check for ticket availability and lock the row to prevent race conditions
  SELECT * INTO v_venue_details
  FROM public.events_venues
  WHERE id = p_event_venue_id FOR UPDATE;

  IF v_venue_details.id IS NULL THEN
      RAISE EXCEPTION 'Event venue not found.';
  END IF;

  IF v_venue_details.no_of_tickets <= 0 THEN
    RAISE EXCEPTION 'No tickets available for this event.';
  END IF;

  -- Decrement the ticket count
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - 1
  WHERE id = p_event_venue_id;

  -- Create the ticket
  INSERT INTO public.tickets(user_id, events_venues_id)
  VALUES (v_user_id, p_event_venue_id);

END;
$$; 