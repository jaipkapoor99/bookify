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
	('00000000-0000-0000-0000-000000000000', 'c56dc136-c31d-4a79-abbd-f51ad34dd3c9', '{"action":"user_signedup","actor_id":"d4cff42c-cd6c-4854-b145-89e3bf57079d","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-06-09 17:08:48.704687+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c92a56d4-b9ac-42cc-93d6-b8fdf8637326', '{"action":"login","actor_id":"d4cff42c-cd6c-4854-b145-89e3bf57079d","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-09 17:08:48.718012+00', ''),
	('00000000-0000-0000-0000-000000000000', '67384237-2124-4e8c-8c1f-d0c76248a3a1', '{"action":"login","actor_id":"d4cff42c-cd6c-4854-b145-89e3bf57079d","actor_name":"Jai Kapoor","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-09 17:08:55.169277+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', 'authenticated', 'authenticated', 'jaipkapoor99@gmail.com', '$2a$10$.A/mHNxtYOkt7fdIDl/G6.vGo.Eh2h61L8BXKSdMYpZ72p37lZB3G', '2025-06-09 17:08:48.712211+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-06-09 17:08:55.170725+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d4cff42c-cd6c-4854-b145-89e3bf57079d", "email": "jaipkapoor99@gmail.com", "full_name": "Jai Kapoor", "email_verified": true, "phone_verified": false}', NULL, '2025-06-09 17:08:48.676583+00', '2025-06-09 17:08:55.173829+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('d4cff42c-cd6c-4854-b145-89e3bf57079d', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', '{"sub": "d4cff42c-cd6c-4854-b145-89e3bf57079d", "email": "jaipkapoor99@gmail.com", "full_name": "Jai Kapoor", "email_verified": false, "phone_verified": false}', 'email', '2025-06-09 17:08:48.695133+00', '2025-06-09 17:08:48.695183+00', '2025-06-09 17:08:48.695183+00', 'feb829a4-4e51-4ac8-973d-41d63f77e3d2');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('72d6e7f4-ac4c-4835-a111-b33b53b57e4f', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', '2025-06-09 17:08:48.718674+00', '2025-06-09 17:08:48.718674+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '49.47.1.90', NULL),
	('9424d94a-7411-4910-9c5c-94a38d7e4376', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', '2025-06-09 17:08:55.170807+00', '2025-06-09 17:08:55.170807+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '49.47.1.90', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('72d6e7f4-ac4c-4835-a111-b33b53b57e4f', '2025-06-09 17:08:48.743796+00', '2025-06-09 17:08:48.743796+00', 'password', '83a7933d-7f10-4718-871f-c62175b6272b'),
	('9424d94a-7411-4910-9c5c-94a38d7e4376', '2025-06-09 17:08:55.174176+00', '2025-06-09 17:08:55.174176+00', 'password', '21387381-5df1-4e97-b150-0cc2f5aeb6c5');


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

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 74, 'iky76edlxhia', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', false, '2025-06-09 17:08:48.726647+00', '2025-06-09 17:08:48.726647+00', NULL, '72d6e7f4-ac4c-4835-a111-b33b53b57e4f'),
	('00000000-0000-0000-0000-000000000000', 75, 'yyt5bqyymmtj', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', false, '2025-06-09 17:08:55.171549+00', '2025-06-09 17:08:55.171549+00', NULL, '9424d94a-7411-4910-9c5c-94a38d7e4376');


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



--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: events_venues; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("user_id", "address1", "address2", "location_id", "created_at", "updated_at", "supabase_id", "role", "name") VALUES
	(19, NULL, NULL, NULL, '2025-06-09 17:09:03.08+00', '2025-06-09 17:09:03.08+00', 'd4cff42c-cd6c-4854-b145-89e3bf57079d', 'customer', NULL);


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--



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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 75, true);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."customers_customer_id_seq"', 20, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_event_id_seq"', 1, false);


--
-- Name: events_venues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_venues_id_seq"', 1, false);


--
-- Name: locations_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."locations_location_id_seq"', 1, false);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tickets_ticket_id_seq"', 1, false);


--
-- Name: venues_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."venues_venue_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
