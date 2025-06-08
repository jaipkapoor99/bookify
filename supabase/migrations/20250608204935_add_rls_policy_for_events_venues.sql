CREATE POLICY "Allow public read access to events_venues"
ON public.events_venues
FOR SELECT
USING (true);
