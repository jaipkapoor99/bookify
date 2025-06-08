-- Step 1: Drop all previously defined, overloaded versions of the book_ticket function.
-- This is necessary to resolve the "function name is not unique" error.
DROP FUNCTION IF EXISTS public.book_ticket(bigint, uuid);
DROP FUNCTION IF EXISTS public.book_ticket(bigint);

-- Step 2: Create the definitive book_ticket function using the correct column name.
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
  -- THIS IS THE KEY FIX: Using "event_venue_id" instead of "id"
  SELECT * INTO v_venue_details
  FROM public.events_venues
  WHERE event_venue_id = p_event_venue_id FOR UPDATE;

  IF v_venue_details.event_venue_id IS NULL THEN
      RAISE EXCEPTION 'Event venue not found.';
  END IF;

  IF v_venue_details.no_of_tickets <= 0 THEN
    RAISE EXCEPTION 'No tickets available for this event.';
  END IF;

  -- Decrement the ticket count
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - 1
  WHERE event_venue_id = p_event_venue_id;

  -- Create the ticket, referencing the correct foreign key
  INSERT INTO public.tickets(user_id, events_venues_id)
  VALUES (v_user_id, p_event_venue_id);

END;
$$; 