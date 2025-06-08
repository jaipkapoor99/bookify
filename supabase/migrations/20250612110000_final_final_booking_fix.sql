-- Step 1: Drop all previously defined, overloaded versions of the book_ticket function.
DROP FUNCTION IF EXISTS public.book_ticket(bigint, uuid);
DROP FUNCTION IF EXISTS public.book_ticket(bigint);

-- Step 2: Create the definitive, correct book_ticket function
CREATE OR REPLACE FUNCTION public.book_ticket(p_event_venue_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_uuid UUID;
  v_internal_user_id INT;
  v_venue_details RECORD;
BEGIN
  -- Step A: Get the current user's auth UUID from the session
  SELECT auth.uid() INTO v_auth_uuid;

  -- Step B: Get the internal integer user_id from the public.users table
  SELECT user_id INTO v_internal_user_id
  FROM public.users
  WHERE supabase_id = v_auth_uuid;

  -- Step C: Verify the user exists in our public users table
  IF v_internal_user_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found in public.users.';
  END IF;

  -- Step D: Check for ticket availability and lock the row
  SELECT * INTO v_venue_details
  FROM public.events_venues
  WHERE event_venue_id = p_event_venue_id FOR UPDATE;

  IF v_venue_details.event_venue_id IS NULL THEN
      RAISE EXCEPTION 'Event venue not found.';
  END IF;

  IF v_venue_details.no_of_tickets <= 0 THEN
    RAISE EXCEPTION 'No tickets available for this event.';
  END IF;

  -- Step E: Decrement the ticket count
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - 1
  WHERE event_venue_id = p_event_venue_id;

  -- Step F: Create the ticket using the correct internal integer customer_id,
  -- the correct events_venues_id foreign key, and a placeholder price.
  INSERT INTO public.tickets(customer_id, events_venues_id, ticket_price)
  VALUES (v_internal_user_id, p_event_venue_id, 500);

END;
$$; 