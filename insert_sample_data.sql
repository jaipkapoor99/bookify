-- Insert sample data for testing
-- Run this AFTER creating the base schema

-- 1. Insert locations
INSERT INTO public.locations (area, city, state, pincode) VALUES
('Marine Drive', 'Mumbai', 'Maharashtra', '400020'),
('Connaught Place', 'Delhi', 'Delhi', '110001'),
('Brigade Road', 'Bangalore', 'Karnataka', '560025');

-- 2. Insert venues
INSERT INTO public.venues (venue_name, location_id) VALUES
('Capital Concert Hall', 1),
('Marine Drive Auditorium', 2),
('Garden City Arena', 3);

-- 3. Insert events
INSERT INTO public.events (name, description, start_time, end_time, image_url) VALUES
('Summer Music Fest 2025', 'A spectacular summer music festival featuring top artists', '2025-07-15 18:00:00+00', '2025-07-15 23:00:00+00', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea'),
('Tech Conference 2025', 'Annual technology conference with industry leaders', '2025-08-20 09:00:00+00', '2025-08-20 17:00:00+00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'),
('The Grand Comedy Show', 'Evening of comedy with renowned comedians', '2025-09-05 19:00:00+00', '2025-09-05 22:00:00+00', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e');

-- 4. Insert events_venues (event-venue combinations)
INSERT INTO public.events_venues (event_id, venue_id, event_date, no_of_tickets, price) VALUES
(1, 3, '2025-07-15', 87, 250000),    -- Summer Music Fest at Garden City Arena
(2, 2, '2025-08-20', 241, 500000),   -- Tech Conference at Marine Drive Auditorium  
(3, 1, '2025-09-05', 47, 120000);    -- Comedy Show at Capital Concert Hall 