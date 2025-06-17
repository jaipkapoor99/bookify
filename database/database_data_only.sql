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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '39379f0f-ebab-4a83-bd6d-b15f0e692b07', '{"action":"user_signedup","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"google"}}', '2025-06-10 18:46:43.547658+00', ''),
	('00000000-0000-0000-0000-000000000000', '64c29990-a028-42d4-bf98-ed46a4c5452e', '{"action":"logout","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-10 18:59:04.459755+00', ''),
	('00000000-0000-0000-0000-000000000000', '0c1c7caa-fe73-4f95-b437-a275c65afc79', '{"action":"login","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-06-10 18:59:55.430492+00', ''),
	('00000000-0000-0000-0000-000000000000', '40c3a0cc-b99c-49c9-8da2-365eda2aa7c6', '{"action":"login","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-06-10 19:02:43.001881+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a8f9baae-5130-40bb-b5fa-096b3f0d706d', '{"action":"token_refreshed","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-10 20:11:41.845687+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cba70e12-d9e9-411f-9dee-43c0f6df6ab2', '{"action":"token_revoked","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-10 20:11:41.847149+00', ''),
	('00000000-0000-0000-0000-000000000000', '47484bb7-4f37-4fd2-a824-1f5c41f14b1c', '{"action":"login","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-06-10 20:16:27.790099+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c9865d6d-3287-4ef0-a505-444438e93b7a', '{"action":"logout","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-10 20:22:06.020894+00', ''),
	('00000000-0000-0000-0000-000000000000', '80c8c1e4-be02-4749-87c8-5f612a812160', '{"action":"login","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-06-10 20:22:14.774727+00', ''),
	('00000000-0000-0000-0000-000000000000', 'afac567a-dbe0-4e4c-b715-e261fe69a2c0', '{"action":"logout","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-10 21:04:00.392487+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fa6fe78-8e85-44ad-ac2d-76dd7049330c', '{"action":"login","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-06-10 21:04:06.657724+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ba02c9d3-4e56-45c8-ab55-57025f717d4a', '{"action":"logout","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-10 21:20:23.258371+00', ''),
	('00000000-0000-0000-0000-000000000000', '169843d9-a9a9-4156-b6cf-61aa466ac5de', '{"action":"login","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-06-10 21:20:31.66224+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c3529228-5aba-4d64-809a-e9ffad734f86', '{"action":"logout","actor_id":"845fc49f-34aa-4db0-b9b8-dfc2afd47472","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-06-10 21:20:55.463128+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '845fc49f-34aa-4db0-b9b8-dfc2afd47472', 'authenticated', 'authenticated', 'jaipkapoor99@gmail.com', NULL, '2025-06-10 18:46:43.554138+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-06-10 21:20:31.662725+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "107469570456290310245", "name": "Jai Kapoor", "email": "jaipkapoor99@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJfWNKMOdaCiKra5S7Z9jdac8KuzNTxo1swSI8-2LTV3DLzUw=s96-c", "full_name": "Jai Kapoor", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJfWNKMOdaCiKra5S7Z9jdac8KuzNTxo1swSI8-2LTV3DLzUw=s96-c", "provider_id": "107469570456290310245", "email_verified": true, "phone_verified": false}', NULL, '2025-06-10 18:46:43.502822+00', '2025-06-10 21:20:31.665795+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('107469570456290310245', '845fc49f-34aa-4db0-b9b8-dfc2afd47472', '{"iss": "https://accounts.google.com", "sub": "107469570456290310245", "name": "Jai Kapoor", "email": "jaipkapoor99@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJfWNKMOdaCiKra5S7Z9jdac8KuzNTxo1swSI8-2LTV3DLzUw=s96-c", "full_name": "Jai Kapoor", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJfWNKMOdaCiKra5S7Z9jdac8KuzNTxo1swSI8-2LTV3DLzUw=s96-c", "provider_id": "107469570456290310245", "email_verified": true, "phone_verified": false}', 'google', '2025-06-10 18:46:43.536756+00', '2025-06-10 18:46:43.536815+00', '2025-06-10 21:20:31.656507+00', 'd5a9c72a-149d-4640-a8a3-6977cc467234');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("event_id", "name", "description", "start_time", "end_time", "image_url", "image_path", "created_at", "updated_at") VALUES
	(1, 'Summer Music Fest 2025', 'A spectacular summer music festival featuring top artists', '2025-07-15 18:00:00+00', '2025-07-15 23:00:00+00', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea', '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(2, 'Tech Conference 2025', 'Annual technology conference with industry leaders', '2025-08-20 09:00:00+00', '2025-08-20 17:00:00+00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(3, 'The Grand Comedy Show', 'Evening of comedy with renowned comedians', '2025-09-05 19:00:00+00', '2025-09-05 22:00:00+00', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e', '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(4, 'Sunburn Festival 2025', 'India''s biggest electronic dance music festival featuring international DJs', '2025-07-15 16:00:00+00', '2025-07-16 04:00:00+00', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(5, 'TechCrunch Disrupt India', 'Premier startup and technology conference bringing together entrepreneurs and investors', '2025-08-20 09:00:00+00', '2025-08-22 18:00:00+00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(6, 'Comedy Nights Live', 'Stand-up comedy show featuring India''s top comedians', '2025-09-05 19:30:00+00', '2025-09-05 22:30:00+00', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e', 'https://images.unsplash.com/photo-1602673221252-6868b6d51a2e', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(7, 'Bollywood Music Awards', 'Annual awards ceremony celebrating the best in Bollywood music', '2025-10-12 18:00:00+00', '2025-10-12 23:00:00+00', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(8, 'Art & Culture Festival', 'Multi-day festival showcasing traditional and contemporary Indian arts', '2025-11-08 10:00:00+00', '2025-11-10 22:00:00+00', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(9, 'Food & Wine Expo', 'Culinary festival featuring celebrity chefs and wine tastings', '2025-12-03 11:00:00+00', '2025-12-05 21:00:00+00', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(10, 'Cricket Premier League Final', 'Final match of the premier cricket tournament', '2025-07-28 19:30:00+00', '2025-07-28 23:30:00+00', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(11, 'Classical Music Concert', 'Evening of Indian classical music featuring renowned artists', '2025-08-14 19:00:00+00', '2025-08-14 22:30:00+00', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(12, 'Fashion Week India', 'Premier fashion event showcasing latest collections from top designers', '2025-09-20 18:00:00+00', '2025-09-23 23:00:00+00', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(13, 'Gaming Championship', 'National esports tournament with multiple game categories', '2025-10-05 10:00:00+00', '2025-10-07 20:00:00+00', 'https://images.unsplash.com/photo-1542751371-adc38448a05e', 'https://images.unsplash.com/photo-1542751371-adc38448a05e', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00');


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."locations" ("location_id", "pincode", "created_at", "updated_at") VALUES
	(1, '400020', '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(2, '110001', '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(3, '560025', '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(79, '400001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(80, '400051', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(81, '110016', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(82, '110048', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(83, '560001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(84, '560078', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(85, '600001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(86, '600028', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(87, '600096', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(88, '500001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(89, '500032', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(90, '500081', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(91, '700001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(92, '700019', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(93, '700091', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(94, '411001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(95, '411038', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(96, '302001', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(97, '395007', '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00');


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."venues" ("venue_id", "venue_name", "location_id", "created_at", "updated_at") VALUES
	(1, 'Capital Concert Hall', 1, '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(2, 'Marine Drive Auditorium', 2, '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(3, 'Garden City Arena', 3, '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(64, 'NSCI Dome', 79, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(65, 'Phoenix Marketcity Arena', 1, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(66, 'Jio Garden', 80, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(67, 'Pragati Maidan', 2, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(68, 'Indira Gandhi Stadium', 81, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(69, 'Kingdom of Dreams', 82, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(70, 'Palace Grounds', 83, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(71, 'UB City Mall', 3, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(72, 'Phoenix MarketCity Whitefield', 84, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(73, 'YMCA Grounds', 85, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(74, 'Express Avenue', 86, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(75, 'Phoenix MarketCity Chennai', 87, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(76, 'Hitex Exhibition Centre', 88, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(77, 'Inorbit Mall', 89, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(78, 'HICC Convention Centre', 90, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(79, 'Science City Auditorium', 91, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(80, 'City Centre Salt Lake', 92, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(81, 'Nicco Park', 93, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(82, 'Shaniwar Wada Grounds', 94, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(83, 'Phoenix MarketCity Pune', 95, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(84, 'SMS Stadium', 96, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(85, 'VR Surat', 97, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00');


--
-- Data for Name: events_venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events_venues" ("event_venue_id", "event_id", "venue_id", "event_venue_date", "no_of_tickets", "price", "created_at", "updated_at") VALUES
	(3, 3, 1, '2025-09-05', 47, 120000, '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(1, 1, 3, '2025-07-15', 73, 250000, '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(2, 2, 2, '2025-08-20', 228, 500000, '2025-06-10 18:46:16.830602+00', '2025-06-10 18:46:16.830602+00'),
	(4, 4, 64, '2025-07-15', 5000, 299900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(5, 4, 70, '2025-07-15', 6000, 279900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(6, 4, 67, '2025-07-15', 4500, 319900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(7, 5, 71, '2025-08-20', 1500, 799900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(8, 5, 77, '2025-08-21', 1200, 849900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(9, 5, 65, '2025-08-22', 1800, 749900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(10, 6, 64, '2025-09-05', 800, 149900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(11, 6, 68, '2025-09-06', 750, 159900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(12, 6, 70, '2025-09-07', 900, 139900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(13, 6, 73, '2025-09-08', 700, 149900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(14, 7, 66, '2025-10-12', 2500, 499900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(15, 7, 69, '2025-10-13', 2000, 549900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(16, 8, 79, '2025-11-08', 1000, 99900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(17, 8, 82, '2025-11-09', 800, 119900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(18, 8, 84, '2025-11-10', 900, 109900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(19, 9, 74, '2025-12-03', 1200, 199900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(20, 9, 78, '2025-12-04', 1000, 219900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(21, 9, 83, '2025-12-05', 1100, 189900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(22, 10, 68, '2025-07-28', 15000, 199900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(23, 10, 84, '2025-07-29', 12000, 179900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(24, 11, 64, '2025-08-14', 600, 79900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(25, 11, 73, '2025-08-15', 550, 84900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(26, 11, 79, '2025-08-16', 500, 74900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(27, 12, 65, '2025-09-20', 800, 299900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(28, 12, 69, '2025-09-21', 700, 319900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(29, 12, 71, '2025-09-22', 750, 279900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(30, 12, 77, '2025-09-23', 650, 299900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(31, 13, 72, '2025-10-05', 2000, 149900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(32, 13, 80, '2025-10-06', 1800, 159900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00'),
	(33, 13, 85, '2025-10-07', 1500, 139900, '2025-06-10 21:55:21.831926+00', '2025-06-10 21:55:21.831926+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("user_id", "supabase_id", "name", "email", "address1", "address2", "address3", "location_id", "role", "created_at", "updated_at") VALUES
	(1, '845fc49f-34aa-4db0-b9b8-dfc2afd47472', 'Jai Kapoor', 'jaipkapoor99@gmail.com', NULL, NULL, NULL, NULL, 'customer', '2025-06-10 18:46:43.48884+00', '2025-06-10 18:46:43.48884+00');


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tickets" ("ticket_id", "customer_id", "event_venue_id", "ticket_price", "quantity", "created_at", "updated_at") VALUES
	(1, 1, 1, 250000, 4, '2025-06-10 18:48:10.514544+00', '2025-06-10 18:48:10.514544+00'),
	(2, 1, 2, 500000, 2, '2025-06-10 19:03:12.01891+00', '2025-06-10 19:03:12.01891+00'),
	(3, 1, 1, 250000, 3, '2025-06-10 20:16:35.945069+00', '2025-06-10 20:16:35.945069+00'),
	(4, 1, 1, 250000, 3, '2025-06-10 20:46:24.928645+00', '2025-06-10 20:46:24.928645+00'),
	(5, 1, 2, 500000, 6, '2025-06-10 20:46:34.655866+00', '2025-06-10 20:46:34.655866+00'),
	(6, 1, 1, 250000, 4, '2025-06-10 21:04:15.3895+00', '2025-06-10 21:04:15.3895+00'),
	(7, 1, 2, 500000, 5, '2025-06-10 21:20:45.241353+00', '2025-06-10 21:20:45.241353+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('event-images', 'event-images', NULL, '2025-06-09 16:29:24.26604+00', '2025-06-09 16:29:24.26604+00', true, false, NULL, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 133, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_event_id_seq"', 13, true);


--
-- Name: events_venues_event_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_venues_event_venue_id_seq"', 33, true);


--
-- Name: locations_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."locations_location_id_seq"', 97, true);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tickets_ticket_id_seq"', 7, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."users_user_id_seq"', 1, true);


--
-- Name: venues_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."venues_venue_id_seq"', 85, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
