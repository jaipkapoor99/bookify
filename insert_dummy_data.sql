-- =================================================================
-- Dummy Data Insertion Script for Booking Platform (v3 - Final)
-- =================================================================
-- This script is idempotent. It first ensures the required UNIQUE
-- constraints exist on the tables and then safely inserts or updates
-- data, preventing errors on subsequent runs.
--
-- To use:
-- 1. Navigate to the SQL Editor in your Supabase dashboard.
-- 2. Copy and paste the entire content of this file.
-- 3. Run the query.
-- =================================================================

-- Step 0: Ensure UNIQUE constraints exist for idempotent inserts.
-- This block will add the constraints only if they do not already exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'events_name_key' AND conrelid = 'public.events'::regclass
    ) THEN
        ALTER TABLE public.events ADD CONSTRAINT events_name_key UNIQUE (name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'venues_venue_name_key' AND conrelid = 'public.venues'::regclass
    ) THEN
        ALTER TABLE public.venues ADD CONSTRAINT venues_venue_name_key UNIQUE (venue_name);
    END IF;
END;
$$;

-- To prevent foreign key constraint errors, we delete from tables
-- in the reverse order of their dependencies.
TRUNCATE TABLE public.tickets RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.events_venues RESTART IDENTITY CASCADE;
-- We do not truncate events, venues, or locations to allow for reuse.

-- =================================================================
-- Step 1: Insert Locations and capture their IDs
-- =================================================================
WITH inserted_locations AS (
  INSERT INTO public.locations (city, state, pincode, area) VALUES
  ('New Delhi', 'Delhi', '110001', 'Connaught Place'),
  ('Mumbai', 'Maharashtra', '400001', 'Colaba'),
  ('Bengaluru', 'Karnataka', '560001', 'MG Road')
  ON CONFLICT (pincode) DO UPDATE SET
    city = EXCLUDED.city,
    area = EXCLUDED.area
  RETURNING location_id, pincode
),

-- =================================================================
-- Step 2: Insert Venues and capture their IDs
-- =================================================================
inserted_venues AS (
  INSERT INTO public.venues (venue_name, venue_address, location_id)
  SELECT
    'Capital Concert Hall',
    '123 Music Lane, Connaught Place',
    il.location_id
  FROM inserted_locations il WHERE il.pincode = '110001'
  UNION ALL
  SELECT
    'Marine Drive Auditorium',
    '456 Seafront Road, Colaba',
    il.location_id
  FROM inserted_locations il WHERE il.pincode = '400001'
  UNION ALL
  SELECT
    'Garden City Arena',
    '789 Tech Park Avenue, MG Road',
    il.location_id
  FROM inserted_locations il WHERE il.pincode = '560001'
  ON CONFLICT (venue_name) DO UPDATE SET
    venue_address = EXCLUDED.venue_address
  RETURNING venue_id, venue_name
),

-- =================================================================
-- Step 3: Insert Events and capture their IDs
-- =================================================================
inserted_events AS (
  INSERT INTO public.events (name, description, start_time, end_time, image_url, image_path) VALUES
  (
    'Summer Music Fest 2025',
    'The biggest outdoor music festival of the year, featuring top artists from around the globe.',
    '2025-07-15 18:00:00+05:30',
    '2025-07-15 23:00:00+05:30',
    'https://placehold.co/600x400/DB2777/FFFFFF?text=Summer+Fest',
    'events/summer_fest.png'
  ),
  (
    'Tech Conference 2025',
    'A deep dive into the future of technology, with keynote speakers from leading tech companies.',
    '2025-08-20 09:00:00+05:30',
    '2025-08-20 17:00:00+05:30',
    'https://placehold.co/600x400/2563EB/FFFFFF?text=Tech+Conf',
    'events/tech_conf.png'
  ),
  (
    'The Grand Comedy Show',
    'An evening of laughter with the most hilarious comedians on the circuit.',
    '2025-09-05 20:00:00+05:30',
    '2025-09-05 22:00:00+05:30',
    'https://placehold.co/600x400/F59E0B/FFFFFF?text=Comedy+Show',
    'events/comedy_show.png'
  )
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description
  RETURNING event_id, name
)

-- =================================================================
-- Step 4: Link Events to Venues using the captured IDs
-- =================================================================
INSERT INTO public.events_venues (event_id, venue_id, no_of_tickets, event_venue_date, price)
SELECT
  ie.event_id,
  iv.venue_id,
  100 AS no_of_tickets,
  '2025-07-15'::date AS event_venue_date,
  250000 AS price
FROM inserted_events ie, inserted_venues iv
WHERE ie.name = 'Summer Music Fest 2025' AND iv.venue_name = 'Garden City Arena'
UNION ALL
SELECT
  ie.event_id,
  iv.venue_id,
  250,
  '2025-08-20'::date,
  500000
FROM inserted_events ie, inserted_venues iv
WHERE ie.name = 'Tech Conference 2025' AND iv.venue_name = 'Marine Drive Auditorium'
UNION ALL
SELECT
  ie.event_id,
  iv.venue_id,
  50,
  '2025-09-05'::date,
  120000
FROM inserted_events ie, inserted_venues iv
WHERE ie.name = 'The Grand Comedy Show' AND iv.venue_name = 'Capital Concert Hall';

-- =================================================================
-- Final Check
-- =================================================================
SELECT 'Dummy data insertion complete for events and venues.' AS status;
SELECT e.name, v.venue_name, ev.price, ev.event_venue_date
FROM public.events_venues ev
JOIN public.events e ON ev.event_id = e.event_id
JOIN public.venues v ON ev.venue_id = v.venue_id; 