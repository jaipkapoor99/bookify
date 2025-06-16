-- Safe Database Population Script
-- This script adds new data to the existing database without conflicts
-- It uses proper subqueries and handles existing data gracefully

BEGIN;

-- Insert new locations (these will get new auto-generated IDs)
INSERT INTO public.locations (pincode) VALUES
('400001'), -- Mumbai Central
('400051'), -- Bandra West, Mumbai  
('110016'), -- Lajpat Nagar, Delhi
('110048'), -- Saket, Delhi
('560001'), -- Bangalore City
('560078'), -- Whitefield, Bangalore
('600001'), -- Chennai Central
('600028'), -- T. Nagar, Chennai
('600096'), -- Velachery, Chennai
('500001'), -- Hyderabad Central
('500032'), -- Jubilee Hills, Hyderabad
('500081'), -- Gachibowli, Hyderabad
('700001'), -- Kolkata Central
('700019'), -- Salt Lake City, Kolkata
('700091'), -- Sector V, Kolkata
('411001'), -- Pune Central
('411038'), -- Koregaon Park, Pune
('302001'), -- Jaipur Central
('395007'); -- Surat

-- Insert new venues (referencing locations by pincode)
INSERT INTO public.venues (venue_name, location_id) VALUES
-- Mumbai venues
('NSCI Dome', (SELECT location_id FROM public.locations WHERE pincode = '400001')),
('Phoenix Marketcity Arena', (SELECT location_id FROM public.locations WHERE pincode = '400020')),
('Jio Garden', (SELECT location_id FROM public.locations WHERE pincode = '400051')),
-- Delhi venues  
('Pragati Maidan', (SELECT location_id FROM public.locations WHERE pincode = '110001')),
('Indira Gandhi Stadium', (SELECT location_id FROM public.locations WHERE pincode = '110016')),
('Kingdom of Dreams', (SELECT location_id FROM public.locations WHERE pincode = '110048')),
-- Bangalore venues
('Palace Grounds', (SELECT location_id FROM public.locations WHERE pincode = '560001')),
('UB City Mall', (SELECT location_id FROM public.locations WHERE pincode = '560025')),
('Phoenix MarketCity Whitefield', (SELECT location_id FROM public.locations WHERE pincode = '560078')),
-- Chennai venues
('YMCA Grounds', (SELECT location_id FROM public.locations WHERE pincode = '600001')),
('Express Avenue', (SELECT location_id FROM public.locations WHERE pincode = '600028')),
('Phoenix MarketCity Chennai', (SELECT location_id FROM public.locations WHERE pincode = '600096')),
-- Hyderabad venues
('Hitex Exhibition Centre', (SELECT location_id FROM public.locations WHERE pincode = '500001')),
('Inorbit Mall', (SELECT location_id FROM public.locations WHERE pincode = '500032')),
('HICC Convention Centre', (SELECT location_id FROM public.locations WHERE pincode = '500081')),
-- Kolkata venues
('Science City Auditorium', (SELECT location_id FROM public.locations WHERE pincode = '700001')),
('City Centre Salt Lake', (SELECT location_id FROM public.locations WHERE pincode = '700019')),
('Nicco Park', (SELECT location_id FROM public.locations WHERE pincode = '700091')),
-- Pune venues
('Shaniwar Wada Grounds', (SELECT location_id FROM public.locations WHERE pincode = '411001')),
('Phoenix MarketCity Pune', (SELECT location_id FROM public.locations WHERE pincode = '411038')),
-- Jaipur venues
('SMS Stadium', (SELECT location_id FROM public.locations WHERE pincode = '302001')),
-- Surat venues
('VR Surat', (SELECT location_id FROM public.locations WHERE pincode = '395007'));

-- Insert new events
INSERT INTO public.events (name, description, start_time, end_time, image_url, image_path) VALUES
('Sunburn Festival 2025', 'India''s biggest electronic dance music festival featuring international DJs', '2025-07-15 16:00:00+00', '2025-07-16 04:00:00+00', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'),
('TechCrunch Disrupt India', 'Premier startup and technology conference bringing together entrepreneurs and investors', '2025-08-20 09:00:00+00', '2025-08-22 18:00:00+00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'),
('Comedy Nights Live', 'Stand-up comedy show featuring India''s top comedians', '2025-09-05 19:30:00+00', '2025-09-05 22:30:00+00', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e'),
('Bollywood Music Awards', 'Annual awards ceremony celebrating the best in Bollywood music', '2025-10-12 18:00:00+00', '2025-10-12 23:00:00+00', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'),
('Art & Culture Festival', 'Multi-day festival showcasing traditional and contemporary Indian arts', '2025-11-08 10:00:00+00', '2025-11-10 22:00:00+00', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'),
('Food & Wine Expo', 'Culinary festival featuring celebrity chefs and wine tastings', '2025-12-03 11:00:00+00', '2025-12-05 21:00:00+00', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'),
('Cricket Premier League Final', 'Final match of the premier cricket tournament', '2025-07-28 19:30:00+00', '2025-07-28 23:30:00+00', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e'),
('Classical Music Concert', 'Evening of Indian classical music featuring renowned artists', '2025-08-14 19:00:00+00', '2025-08-14 22:30:00+00', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'),
('Fashion Week India', 'Premier fashion event showcasing latest collections from top designers', '2025-09-20 18:00:00+00', '2025-09-23 23:00:00+00', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b'),
('Gaming Championship', 'National esports tournament with multiple game categories', '2025-10-05 10:00:00+00', '2025-10-07 20:00:00+00', 'https://images.unsplash.com/photo-1542751371-adc38448a05e', 'https://images.unsplash.com/photo-1542751371-adc38448a05e');

-- Insert event-venue combinations using proper lookups
INSERT INTO public.events_venues (event_id, venue_id, event_venue_date, no_of_tickets, price) VALUES
-- Sunburn Festival 2025 (Multiple venues)
((SELECT event_id FROM public.events WHERE name = 'Sunburn Festival 2025'), (SELECT venue_id FROM public.venues WHERE venue_name = 'NSCI Dome'), '2025-07-15', 5000, 299900),
((SELECT event_id FROM public.events WHERE name = 'Sunburn Festival 2025'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Palace Grounds'), '2025-07-15', 6000, 279900),
((SELECT event_id FROM public.events WHERE name = 'Sunburn Festival 2025'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Pragati Maidan'), '2025-07-15', 4500, 319900),

-- TechCrunch Disrupt India 
((SELECT event_id FROM public.events WHERE name = 'TechCrunch Disrupt India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'UB City Mall'), '2025-08-20', 1500, 799900),
((SELECT event_id FROM public.events WHERE name = 'TechCrunch Disrupt India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Inorbit Mall'), '2025-08-21', 1200, 849900),
((SELECT event_id FROM public.events WHERE name = 'TechCrunch Disrupt India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Phoenix Marketcity Arena'), '2025-08-22', 1800, 749900),

-- Comedy Nights Live
((SELECT event_id FROM public.events WHERE name = 'Comedy Nights Live'), (SELECT venue_id FROM public.venues WHERE venue_name = 'NSCI Dome'), '2025-09-05', 800, 149900),
((SELECT event_id FROM public.events WHERE name = 'Comedy Nights Live'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Indira Gandhi Stadium'), '2025-09-06', 750, 159900),
((SELECT event_id FROM public.events WHERE name = 'Comedy Nights Live'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Palace Grounds'), '2025-09-07', 900, 139900),
((SELECT event_id FROM public.events WHERE name = 'Comedy Nights Live'), (SELECT venue_id FROM public.venues WHERE venue_name = 'YMCA Grounds'), '2025-09-08', 700, 149900),

-- Bollywood Music Awards
((SELECT event_id FROM public.events WHERE name = 'Bollywood Music Awards'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Jio Garden'), '2025-10-12', 2500, 499900),
((SELECT event_id FROM public.events WHERE name = 'Bollywood Music Awards'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Kingdom of Dreams'), '2025-10-13', 2000, 549900),

-- Art & Culture Festival
((SELECT event_id FROM public.events WHERE name = 'Art & Culture Festival'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Science City Auditorium'), '2025-11-08', 1000, 99900),
((SELECT event_id FROM public.events WHERE name = 'Art & Culture Festival'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Shaniwar Wada Grounds'), '2025-11-09', 800, 119900),
((SELECT event_id FROM public.events WHERE name = 'Art & Culture Festival'), (SELECT venue_id FROM public.venues WHERE venue_name = 'SMS Stadium'), '2025-11-10', 900, 109900),

-- Food & Wine Expo
((SELECT event_id FROM public.events WHERE name = 'Food & Wine Expo'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Express Avenue'), '2025-12-03', 1200, 199900),
((SELECT event_id FROM public.events WHERE name = 'Food & Wine Expo'), (SELECT venue_id FROM public.venues WHERE venue_name = 'HICC Convention Centre'), '2025-12-04', 1000, 219900),
((SELECT event_id FROM public.events WHERE name = 'Food & Wine Expo'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Phoenix MarketCity Pune'), '2025-12-05', 1100, 189900),

-- Cricket Premier League Final
((SELECT event_id FROM public.events WHERE name = 'Cricket Premier League Final'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Indira Gandhi Stadium'), '2025-07-28', 15000, 199900),
((SELECT event_id FROM public.events WHERE name = 'Cricket Premier League Final'), (SELECT venue_id FROM public.venues WHERE venue_name = 'SMS Stadium'), '2025-07-29', 12000, 179900),

-- Classical Music Concert
((SELECT event_id FROM public.events WHERE name = 'Classical Music Concert'), (SELECT venue_id FROM public.venues WHERE venue_name = 'NSCI Dome'), '2025-08-14', 600, 79900),
((SELECT event_id FROM public.events WHERE name = 'Classical Music Concert'), (SELECT venue_id FROM public.venues WHERE venue_name = 'YMCA Grounds'), '2025-08-15', 550, 84900),
((SELECT event_id FROM public.events WHERE name = 'Classical Music Concert'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Science City Auditorium'), '2025-08-16', 500, 74900),

-- Fashion Week India
((SELECT event_id FROM public.events WHERE name = 'Fashion Week India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Phoenix Marketcity Arena'), '2025-09-20', 800, 299900),
((SELECT event_id FROM public.events WHERE name = 'Fashion Week India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Kingdom of Dreams'), '2025-09-21', 700, 319900),
((SELECT event_id FROM public.events WHERE name = 'Fashion Week India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'UB City Mall'), '2025-09-22', 750, 279900),
((SELECT event_id FROM public.events WHERE name = 'Fashion Week India'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Inorbit Mall'), '2025-09-23', 650, 299900),

-- Gaming Championship
((SELECT event_id FROM public.events WHERE name = 'Gaming Championship'), (SELECT venue_id FROM public.venues WHERE venue_name = 'Phoenix MarketCity Whitefield'), '2025-10-05', 2000, 149900),
((SELECT event_id FROM public.events WHERE name = 'Gaming Championship'), (SELECT venue_id FROM public.venues WHERE venue_name = 'City Centre Salt Lake'), '2025-10-06', 1800, 159900),
((SELECT event_id FROM public.events WHERE name = 'Gaming Championship'), (SELECT venue_id FROM public.venues WHERE venue_name = 'VR Surat'), '2025-10-07', 1500, 139900);

-- Update sequences to current max values
SELECT setval('public.locations_location_id_seq', (SELECT COALESCE(MAX(location_id), 1) FROM public.locations));
SELECT setval('public.venues_venue_id_seq', (SELECT COALESCE(MAX(venue_id), 1) FROM public.venues));
SELECT setval('public.events_event_id_seq', (SELECT COALESCE(MAX(event_id), 1) FROM public.events));
SELECT setval('public.events_venues_event_venue_id_seq', (SELECT COALESCE(MAX(event_venue_id), 1) FROM public.events_venues));

-- Display final summary
SELECT 'Data insertion completed successfully!' as status;

SELECT 
    'Locations' as table_name, 
    COUNT(*) as total_records 
FROM public.locations
UNION ALL
SELECT 
    'Venues' as table_name, 
    COUNT(*) as total_records 
FROM public.venues
UNION ALL
SELECT 
    'Events' as table_name, 
    COUNT(*) as total_records 
FROM public.events
UNION ALL
SELECT 
    'Events_Venues' as table_name, 
    COUNT(*) as total_records 
FROM public.events_venues
ORDER BY table_name;

COMMIT; 