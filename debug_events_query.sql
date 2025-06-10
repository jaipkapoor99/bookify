-- Test the events query that's failing
-- This should be run in Supabase SQL Editor to debug the 400 error

-- First, check if tables exist
SELECT 'events' as table_name, count(*) as row_count FROM public.events
UNION ALL
SELECT 'venues', count(*) FROM public.venues  
UNION ALL
SELECT 'locations', count(*) FROM public.locations
UNION ALL
SELECT 'events_venues', count(*) FROM public.events_venues;

-- Test the specific query that's failing
SELECT 
  e.event_id,
  e.name,
  e.description,
  e.start_time,
  e.end_time,
  e.image_url,
  e.image_path,
  ev.event_venue_id,
  v.venue_name,
  l.pincode
FROM public.events e
LEFT JOIN public.events_venues ev ON e.event_id = ev.event_id
LEFT JOIN public.venues v ON ev.venue_id = v.venue_id
LEFT JOIN public.locations l ON v.location_id = l.location_id
ORDER BY e.start_time ASC
LIMIT 5; 