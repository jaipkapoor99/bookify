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

--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("event_id", "name", "description", "start_time", "end_time", "created_at", "updated_at", "image_url", "image_path") VALUES
	(1, 'Summer Music Fest 2025', 'The biggest outdoor music festival of the year, featuring top artists from around the globe.', '2025-07-15 12:30:00+00', '2025-07-15 17:30:00+00', '2025-06-09 17:58:34.582857+00', '2025-06-09 17:58:34.582857+00', 'https://placehold.co/600x400/DB2777/FFFFFF?text=Summer+Fest', 'events/summer_fest.png'),
	(2, 'Tech Conference 2025', 'A deep dive into the future of technology, with keynote speakers from leading tech companies.', '2025-08-20 03:30:00+00', '2025-08-20 11:30:00+00', '2025-06-09 17:58:34.582857+00', '2025-06-09 17:58:34.582857+00', 'https://placehold.co/600x400/2563EB/FFFFFF?text=Tech+Conf', 'events/tech_conf.png'),
	(3, 'The Grand Comedy Show', 'An evening of laughter with the most hilarious comedians on the circuit.', '2025-09-05 14:30:00+00', '2025-09-05 16:30:00+00', '2025-06-09 17:58:34.582857+00', '2025-06-09 17:58:34.582857+00', 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Comedy+Show', 'events/comedy_show.png');


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."locations" ("location_id", "created_at", "city", "state", "pincode", "area") VALUES
	(1, '2025-06-09 17:58:34.582857+00', 'New Delhi', 'Delhi', '110001', 'Connaught Place'),
	(2, '2025-06-09 17:58:34.582857+00', 'Mumbai', 'Maharashtra', '400001', 'Colaba'),
	(3, '2025-06-09 17:58:34.582857+00', 'Bengaluru', 'Karnataka', '560001', 'MG Road');


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."venues" ("venue_id", "venue_name", "venue_address", "location_id", "created_at", "updated_at") VALUES
	(1, 'Capital Concert Hall', '123 Music Lane, Connaught Place', 1, '2025-06-09 17:58:34.582857+00', '2025-06-09 17:58:34.582857+00'),
	(2, 'Marine Drive Auditorium', '456 Seafront Road, Colaba', 2, '2025-06-09 17:58:34.582857+00', '2025-06-09 17:58:34.582857+00'),
	(3, 'Garden City Arena', '789 Tech Park Avenue, MG Road', 3, '2025-06-09 17:58:34.582857+00', '2025-06-09 17:58:34.582857+00');


--
-- Data for Name: events_venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events_venues" ("event_venue_id", "event_id", "venue_id", "no_of_tickets", "event_venue_date", "price") VALUES
	(3, 3, 1, 47, '2025-09-05', 120000),
	(1, 1, 3, 87, '2025-07-15', 250000),
	(2, 2, 2, 241, '2025-08-20', 500000);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("user_id", "address1", "address2", "location_id", "created_at", "updated_at", "supabase_id", "role", "name") VALUES
	(19, NULL, NULL, NULL, '2025-06-09 17:09:03.08+00', '2025-06-09 17:09:03.08+00', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', 'customer', NULL),
	(30, NULL, NULL, NULL, '2025-06-09 19:14:52.887331+00', '2025-06-09 19:14:52.887331+00', '48328f02-3de9-4ef3-a189-2821f48db90e', 'customer', 'Jai Kapoor');


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tickets" ("ticket_id", "customer_id", "created_at", "updated_at", "ticket_price", "events_venues_id", "quantity") OVERRIDING SYSTEM VALUE VALUES
	(1, 19, '2025-06-09 18:01:17.877329+00', '2025-06-09 18:01:17.877329+00', 250000, 1, 1),
	(2, 19, '2025-06-09 18:05:31.260054+00', '2025-06-09 18:05:31.260054+00', 250000, 1, 3),
	(3, 19, '2025-06-09 18:06:02.834645+00', '2025-06-09 18:06:02.834645+00', 250000, 1, 7),
	(4, 19, '2025-06-09 18:08:13.385348+00', '2025-06-09 18:08:13.385348+00', 500000, 2, 5),
	(5, 19, '2025-06-09 18:25:52.783212+00', '2025-06-09 18:25:52.783212+00', 120000, 3, 3),
	(6, 30, '2025-06-09 19:33:23.311208+00', '2025-06-09 19:33:23.311208+00', 500000, 2, 3),
	(7, 30, '2025-06-09 21:19:36.236027+00', '2025-06-09 21:19:36.236027+00', 250000, 1, 2),
	(8, 19, '2025-06-09 21:53:48.521614+00', '2025-06-09 21:53:48.521614+00', 500000, 2, 1);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."customers_customer_id_seq"', 30, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_event_id_seq"', 3, true);


--
-- Name: events_venues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_venues_id_seq"', 3, true);


--
-- Name: locations_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."locations_location_id_seq"', 3, true);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tickets_ticket_id_seq"', 8, true);


--
-- Name: venues_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."venues_venue_id_seq"', 3, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
