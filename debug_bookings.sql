-- Debug MyBookings Issue
-- Run this in Supabase SQL Editor to check data

-- Check if there are any users
SELECT 
  'Users Count' as table_name,
  COUNT(*) as record_count
FROM public.users;

-- Check if there are any tickets
SELECT 
  'Tickets Count' as table_name,
  COUNT(*) as record_count
FROM public.tickets;

-- Check user-ticket relationship
SELECT 
  u.user_id,
  u.email,
  u.supabase_id,
  COUNT(t.ticket_id) as ticket_count
FROM public.users u
LEFT JOIN public.tickets t ON u.user_id = t.customer_id
GROUP BY u.user_id, u.email, u.supabase_id
ORDER BY u.user_id;

-- Check full ticket details with joins
SELECT 
  t.ticket_id,
  t.customer_id,
  t.ticket_price,
  t.created_at,
  u.email as customer_email,
  ev.event_venue_date,
  e.name as event_name,
  v.venue_name,
  l.pincode
FROM public.tickets t
LEFT JOIN public.users u ON t.customer_id = u.user_id
LEFT JOIN public.events_venues ev ON t.events_venues_id = ev.event_venue_id
LEFT JOIN public.events e ON ev.event_id = e.event_id
LEFT JOIN public.venues v ON ev.venue_id = v.venue_id
LEFT JOIN public.locations l ON v.location_id = l.location_id
ORDER BY t.created_at DESC
LIMIT 10;

-- Check if quantity column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tickets' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 