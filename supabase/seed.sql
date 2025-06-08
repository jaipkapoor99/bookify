SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Custom Seed Data
-- Disabling RLS for seeding
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_venues DISABLE ROW LEVEL SECURITY;

-- Seed Locations (India)
TRUNCATE public.locations RESTART IDENTITY CASCADE;
INSERT INTO public.locations (city, state, pincode, area) VALUES
('Mumbai', 'Maharashtra', '400001', 'South Mumbai'),
('Delhi', 'Delhi', '110001', 'Central Delhi'),
('Bengaluru', 'Karnataka', '560001', 'MG Road'),
('Chennai', 'Tamil Nadu', '600002', 'Triplicane'),
('Kolkata', 'West Bengal', '700001', 'B. B. D. Bagh');

-- Seed Venues (20 venues across India)
TRUNCATE public.venues RESTART IDENTITY CASCADE;
INSERT INTO public.venues (venue_name, venue_address, location_id) VALUES
('Wankhede Stadium', 'Vinoo Mankad Rd, Churchgate', 1),
('NSCI Dome', 'Lala Lajpatrai Marg, Worli', 1),
('Jio World Centre', 'G Block, Bandra Kurla Complex', 1),
('D.Y. Patil Stadium', 'Sector 7, Nerul', 1),
('Jawaharlal Nehru Stadium', 'Pragati Vihar', 2),
('Indira Gandhi Arena', 'I.G. Indoor Stadium Complex', 2),
('Thyagaraj Sports Complex', 'INA Colony', 2),
('Siri Fort Auditorium', 'August Kranti Marg', 2),
('M. Chinnaswamy Stadium', 'Cubbon Road', 3),
('Bangalore Palace Grounds', 'Palace Rd, Vasanth Nagar', 3),
('Kanteerava Indoor Stadium', 'Kasturba Road', 3),
('UB City Amphitheatre', 'Vittal Mallya Road', 3),
('M. A. Chidambaram Stadium', 'Victoria Hostel Road, Chepauk', 4),
('Jawaharlal Nehru Stadium, Chennai', 'Sydenhams Road, Periyamet', 4),
('The Music Academy', 'TTK Road, Royapettah', 4),
('Sir Mutha Venkatasubba Rao Concert Hall', 'Shenstone Park, Harrington Road', 4),
('Eden Gardens', 'Maidan, B. B. D. Bagh', 5),
('Salt Lake Stadium (VYBK)', 'JB Block, Sector III, Salt Lake City', 5),
('Netaji Indoor Stadium', 'Eden Gardens, B. B. D. Bagh', 5),
('Science City Auditorium', 'JBS Haldane Avenue', 5);

-- Seed Events (20 events with an Indian context)
TRUNCATE public.events RESTART IDENTITY CASCADE;
INSERT INTO public.events (name, description, start_time, end_time, image_url) VALUES
('India IT Conclave 2025', 'The premier conference for India''s tech industry.', '2025-11-10 09:00:00+05:30', '2025-11-12 17:00:00+05:30', 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop'),
('Sunburn Festival Goa', 'Asia''s largest electronic dance music festival.', '2025-12-28 14:00:00+05:30', '2025-12-30 23:00:00+05:30', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'),
('Arijit Singh - Live in Concert', 'Experience the soulful voice of Arijit Singh.', '2025-10-05 19:00:00+05:30', '2025-10-05 22:00:00+05:30', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop'),
('Kingdom of Dreams: Zangoora', 'The Gypsy Prince, a Bollywood-style musical.', '2025-09-20 20:00:00+05:30', '2025-09-20 22:30:00+05:30', 'https://images.unsplash.com/photo-1596824445523-7a0fe2591be3?q=80&w=2070&auto=format&fit=crop'),
('IPL: Mumbai Indians vs CSK', 'A high-voltage clash in the Indian Premier League.', '2026-04-12 19:30:00+05:30', '2026-04-12 23:00:00+05:30', 'https://images.unsplash.com/photo-1594466946995-1591088e52a9?q=80&w=1932&auto=format&fit=crop'),
('Carnatic Music Festival', 'Celebrating the rich tradition of Carnatic music.', '2025-12-15 18:00:00+05:30', '2025-12-25 21:00:00+05:30', 'https://images.unsplash.com/photo-1580792940191-4b1364d937ce?q=80&w=2070&auto=format&fit=crop'),
('ISL: Bengaluru FC vs ATK', 'Indian Super League football match.', '2025-11-22 20:00:00+05:30', '2025-11-22 22:00:00+05:30', 'https://images.unsplash.com/photo-1579952516518-6c21a4fa8fbe?q=80&w=1974&auto=format&fit=crop'),
('Jaipur Literature Festival', 'The "greatest literary show on Earth".', '2026-01-22 10:00:00+05:30', '2026-01-26 18:00:00+05:30', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop'),
('Shreya Ghoshal Live', 'The melody queen performs her chart-topping hits.', '2025-11-08 19:30:00+05:30', '2025-11-08 22:00:00+05:30', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop'),
('Auto Expo - The Motor Show', 'India''s largest automobile show.', '2026-02-08 10:00:00+05:30', '2026-02-13 18:00:00+05:30', 'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?q=80&w=2070&auto=format&fit=crop'),
('Zakir Khan - Stand-Up Special', 'The "Sakht Launda" himself, live on stage.', '2025-10-18 20:00:00+05:30', '2025-10-18 22:00:00+05:30', 'https://images.unsplash.com/photo-1587825140708-df876c12b44e?q=80&w=2070&auto=format&fit=crop'),
('Kolkata International Film Festival', 'A prestigious event showcasing global cinema.', '2025-11-10 11:00:00+05:30', '2025-11-17 21:00:00+05:30', 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop'),
('BGMI India Series Finals', 'The grand finals of the official Battlegrounds Mobile India tournament.', '2025-09-26 16:00:00+05:30', '2025-09-28 22:00:00+05:30', 'https://images.unsplash.com/photo-1542751371-665961545943?q=80&w=2070&auto=format&fit=crop'),
('Great Indian Food Festival', 'A culinary journey through the diverse cuisines of India.', '2025-11-01 12:00:00+05:30', '2025-11-03 22:00:00+05:30', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'),
('Diljit Dosanjh - Born to Shine Tour', 'The Punjabi superstar live in concert.', '2025-12-20 20:00:00+05:30', '2025-12-20 23:00:00+05:30', 'https://images.unsplash.com/photo-1555231955-34a8a548c7c9?q=80&w=2070&auto=format&fit=crop'),
('Rann Utsav', 'A cultural festival at the Great Rann of Kutch.', '2025-11-01 10:00:00+05:30', '2026-02-20 18:00:00+05:30', 'https://images.unsplash.com/photo-1616738339616-43b952a1b9a8?q=80&w=1964&auto=format&fit=crop'),
('Pro Kabaddi League Finals', 'The championship match of the Pro Kabaddi League.', '2025-10-04 19:00:00+05:30', '2025-10-04 21:00:00+05:30', 'https://images.unsplash.com/photo-1559166631-ef208440018d?q=80&w=2070&auto=format&fit=crop'),
('IPL: KKR vs RCB', 'Kolkata Knight Riders take on Royal Challengers Bengaluru.', '2026-05-02 19:30:00+05:30', '2026-05-02 23:00:00+05:30', 'https://images.unsplash.com/photo-1629280263152-710a30b05b5f?q=80&w=1974&auto=format&fit=crop'),
('India Art Fair', 'South Asia''s leading platform for modern and contemporary art.', '2026-02-01 11:00:00+05:30', '2026-02-04 19:00:00+05:30', 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop'),
('NH7 Weekender', 'India''s "happiest music festival".', '2025-11-28 15:00:00+05:30', '2025-11-30 22:00:00+05:30', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop');

-- Seed Event-Venue relationships (20+ relationships)
TRUNCATE public.events_venues RESTART IDENTITY CASCADE;
INSERT INTO public.events_venues (event_id, venue_id, no_of_tickets, event_venue_date) VALUES
(1, 10, 8000, '2025-11-10'),
(2, 4, 25000, '2025-12-28'),
(3, 2, 10000, '2025-10-05'),
(4, 8, 2500, '2025-09-20'),
(5, 1, 40000, '2026-04-12'),
(6, 15, 3000, '2025-12-15'),
(7, 9, 50000, '2025-11-22'),
(8, 7, 5000, '2026-01-22'),
(9, 19, 12000, '2025-11-08'),
(10, 6, 100000, '2026-02-08'),
(11, 20, 2800, '2025-10-18'),
(12, 20, 2800, '2025-11-10'),
(13, 7, 15000, '2025-09-26'),
(14, 5, 20000, '2025-11-01'),
(15, 6, 20000, '2025-12-20'),
(16, 1, 1, '2025-11-01'), -- Rann Utsav is location-specific, venue is placeholder
(17, 11, 8000, '2025-10-04'),
(18, 17, 68000, '2026-05-02'),
(19, 7, 15000, '2026-02-01'),
(20, 11, 15000, '2025-11-28'),
(3, 12, 5000, '2025-10-07'), -- Arijit Singh second Bengaluru date
(5, 13, 50000, '2026-04-25'); -- MI vs CSK return leg in Chennai

SET session_replication_role = 'origin';
