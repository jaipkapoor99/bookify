-- Enable RLS for all relevant tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for public, read-only access
-- Drop policy first to make sure the script is re-runnable
DROP POLICY IF EXISTS "Allow public read access" ON public.events;
CREATE POLICY "Allow public read access" ON public.events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.venues;
CREATE POLICY "Allow public read access" ON public.venues
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.locations;
CREATE POLICY "Allow public read access" ON public.locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.events_venues;
CREATE POLICY "Allow public read access" ON public.events_venues
  FOR SELECT USING (true); 