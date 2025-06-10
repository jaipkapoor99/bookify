-- Fix the book_ticket function to use the correct column name 'event_venue_id'
-- This should be run directly in the Supabase SQL editor

CREATE OR REPLACE FUNCTION public.book_ticket(
  p_event_venue_id bigint,
  p_quantity int DEFAULT 1
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_auth_uuid UUID;
  v_internal_user_id INT;
  v_venue_details RECORD;
BEGIN
  -- Validate quantity
  IF p_quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1';
  END IF;

  -- Get the current user's auth UUID from the session
  SELECT auth.uid() INTO v_auth_uuid;
  IF v_auth_uuid IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated.';
  END IF;

  -- Get the internal user_id
  SELECT user_id INTO v_internal_user_id
  FROM public.users
  WHERE supabase_id = v_auth_uuid
  LIMIT 1;

  -- Verify a user profile was found
  IF v_internal_user_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found. Please complete your profile before booking.';
  END IF;

  -- Check for ticket availability and lock the row
  SELECT * INTO v_venue_details
  FROM public.events_venues
  WHERE event_venue_id = p_event_venue_id FOR UPDATE;

  IF v_venue_details.event_venue_id IS NULL THEN
      RAISE EXCEPTION 'Event venue not found.';
  END IF;

  IF v_venue_details.no_of_tickets < p_quantity THEN
    RAISE EXCEPTION 'Not enough tickets available. Only % tickets remaining.', v_venue_details.no_of_tickets;
  END IF;

  -- Decrement the ticket count
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - p_quantity
  WHERE event_venue_id = p_event_venue_id;

  -- FIXED: Use event_venue_id instead of events_venues_id
  INSERT INTO public.tickets(customer_id, event_venue_id, ticket_price, quantity)
  VALUES (v_internal_user_id, p_event_venue_id, v_venue_details.price, p_quantity);

END;
$$; 