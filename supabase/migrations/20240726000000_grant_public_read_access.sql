-- Grant public read-only access to core event and venue tables.
-- These policies allow any user (authenticated or anonymous) to view
-- event, venue, and location information, which is necessary for the
-- main event listing and detail pages.

-- 1. Allow public read access to 'events' table
CREATE POLICY "Allow public read access to events"
ON public.events
FOR SELECT
USING (true);

-- 2. Allow public read access to 'venues' table
CREATE POLICY "Allow public read access to venues"
ON public.venues
FOR SELECT
USING (true);

-- 3. Allow public read access to 'locations' table
CREATE POLICY "Allow public read access to locations"
ON public.locations
FOR SELECT
USING (true);

-- 4. Allow public read access to 'events_venues' table
CREATE POLICY "Allow public read access to events_venues"
ON public.events_venues
FOR SELECT
USING (true); 