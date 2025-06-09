-- =================================================================
-- Add Quantity Support to Bookings
-- =================================================================
-- This migration adds a 'quantity' column to the tickets table and
-- updates the 'book_ticket' function to handle multiple ticket
-- purchases in a single transaction.
-- =================================================================

-- Step 1: Add the 'quantity' column to the tickets table
-- This column will store the number of tickets purchased in a single booking.
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Step 2: Replace the booking function with a version that accepts quantity
CREATE OR REPLACE FUNCTION public.book_ticket(p_event_venue_id bigint, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_auth_uuid UUID;
  v_internal_user_id INT;
  v_venue_details RECORD;
BEGIN
  -- 1. Get the current user's auth UUID
  SELECT auth.uid() INTO v_auth_uuid;
  IF v_auth_uuid IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated.';
  END IF;

  -- 2. Get the internal user_id from the public users table
  SELECT user_id INTO v_internal_user_id
  FROM public.users
  WHERE supabase_id = v_auth_uuid
  LIMIT 1;

  IF v_internal_user_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found. Please complete your profile before booking.';
  END IF;

  -- 3. Check for ticket availability and lock the row for the transaction
  SELECT * INTO v_venue_details
  FROM public.events_venues
  WHERE event_venue_id = p_event_venue_id FOR UPDATE;

  IF v_venue_details.event_venue_id IS NULL THEN
    RAISE EXCEPTION 'Event venue not found.';
  END IF;

  -- 4. Check if enough tickets are available for the requested quantity
  IF v_venue_details.no_of_tickets < p_quantity THEN
    RAISE EXCEPTION 'Not enough tickets available. Only % remaining.', v_venue_details.no_of_tickets;
  END IF;

  -- 5. Decrement the ticket count by the purchased quantity
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - p_quantity
  WHERE event_venue_id = p_event_venue_id;

  -- 6. Create the ticket record, now including the quantity
  INSERT INTO public.tickets(customer_id, events_venues_id, ticket_price, quantity)
  VALUES (v_internal_user_id, p_event_venue_id, v_venue_details.price, p_quantity);

END;
$$;

-- Verify the migration
DO $$
BEGIN
    -- Check if quantity column exists after migration
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets' 
        AND column_name = 'quantity'
    ) THEN
        RAISE NOTICE 'SUCCESS: Quantity column is now present in tickets table';
    ELSE
        RAISE NOTICE 'ERROR: Quantity column was not added to tickets table';
    END IF;
END
$$; 