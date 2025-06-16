-- Drop the old function if it exists to avoid conflicts.
DROP FUNCTION IF EXISTS public.get_my_bookings();
DROP FUNCTION IF EXISTS public.get_my_bookings_with_details();

-- Create the optimized function to fetch all booking details in a single query
-- This eliminates the N+1 query problem by using JOINs instead of multiple API calls
CREATE OR REPLACE FUNCTION public.get_my_bookings_with_details(p_customer_id int)
RETURNS TABLE (
  ticket_id int,
  customer_id int,
  event_venue_id int,
  ticket_price int,
  quantity int,
  created_at timestamptz,
  updated_at timestamptz,
  event_venue_date date,
  event_venue_price int,
  no_of_tickets int,
  venue_name text,
  pincode text,
  event_name text,
  event_description text,
  event_start_time timestamptz,
  event_end_time timestamptz,
  event_image_url text,
  event_image_path text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    t.ticket_id,
    t.customer_id,
    t.event_venue_id,
    t.ticket_price,
    t.quantity,
    t.created_at,
    t.updated_at,
    ev.event_venue_date,
    ev.price as event_venue_price,
    ev.no_of_tickets,
    v.venue_name,
    l.pincode,
    e.name as event_name,
    e.description as event_description,
    e.start_time as event_start_time,
    e.end_time as event_end_time,
    e.image_url as event_image_url,
    e.image_path as event_image_path
  FROM public.tickets t
  INNER JOIN public.events_venues ev ON t.event_venue_id = ev.event_venue_id
  INNER JOIN public.venues v ON ev.venue_id = v.venue_id
  INNER JOIN public.events e ON ev.event_id = e.event_id
  LEFT JOIN public.locations l ON v.location_id = l.location_id
  WHERE t.customer_id = p_customer_id
  ORDER BY t.created_at DESC;
$$;

-- Create the legacy function for backward compatibility
CREATE OR REPLACE FUNCTION public.get_my_bookings()
RETURNS SETOF public.tickets
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.tickets
  WHERE customer_id IN (
    SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
  );
$$; 