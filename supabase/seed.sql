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
	('00000000-0000-0000-0000-000000000000', '2d504cf6-66d7-4b0f-9f26-4d692afc71b6', '{"action":"user_confirmation_requested","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-21 12:28:00.639124+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cd7468e-b21c-4d9d-b676-9879fcf31a7a', '{"action":"user_signedup","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-04-21 12:30:03.714601+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a4ea90ea-89f5-41d0-bc6b-11a6b4f4aba0', '{"action":"login","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-21 13:26:47.182294+00', ''),
	('00000000-0000-0000-0000-000000000000', '23434179-ad34-4b8a-b319-7819c9a5b2ce', '{"action":"token_refreshed","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-22 07:30:37.895159+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eab18a94-9d48-44ef-978c-8038d00718ac', '{"action":"token_revoked","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-22 07:30:37.918626+00', ''),
	('00000000-0000-0000-0000-000000000000', '889c9e25-8ce9-47eb-abe9-edf095456d65', '{"action":"login","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 07:33:57.144178+00', ''),
	('00000000-0000-0000-0000-000000000000', '063c0eaf-fa30-4a50-a172-9304d5d572c4', '{"action":"logout","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-22 08:32:03.237488+00', ''),
	('00000000-0000-0000-0000-000000000000', '6dab524f-34be-4bd2-9ae1-d97ddce3f018', '{"action":"login","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 08:49:50.225112+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d308f19-6997-493e-ac8b-4bf94ed7ed05', '{"action":"login","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 08:58:27.69573+00', ''),
	('00000000-0000-0000-0000-000000000000', '73195ec9-4b06-42be-ae13-8a26452634f9', '{"action":"token_refreshed","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-22 09:56:58.240723+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9e0da52-b09e-4e13-99a8-3896a45551e2', '{"action":"token_revoked","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-22 09:56:58.242454+00', ''),
	('00000000-0000-0000-0000-000000000000', '6354c5da-49bb-4009-9dc2-1f15bc10ea0a', '{"action":"token_refreshed","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-22 10:55:30.562686+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c7c7dce-c83e-4f22-b3c3-f916fd1968a7', '{"action":"token_revoked","actor_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-22 10:55:30.564391+00', ''),
	('00000000-0000-0000-0000-000000000000', '142a0a3f-acf3-4442-8f1a-02c3518bf872', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"b098da1d-40ac-42e9-a4f6-756edff92f6d","user_phone":""}}', '2025-04-25 09:35:46.473269+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ef981a6-794f-4801-ae27-ed14f2815419', '{"action":"user_confirmation_requested","actor_id":"e796cb13-0fce-41c4-97f7-7137568dd5f6","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 12:03:44.441126+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd87b1a46-da40-4fc3-b267-bf145a36b9ae', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"e796cb13-0fce-41c4-97f7-7137568dd5f6","user_phone":""}}', '2025-04-25 12:08:03.694381+00', ''),
	('00000000-0000-0000-0000-000000000000', '546be6ea-2ac1-4b80-b797-f8146420f707', '{"action":"user_confirmation_requested","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 12:09:29.855559+00', ''),
	('00000000-0000-0000-0000-000000000000', '362518c7-d3ab-4ac7-87f4-b0f00cdce760', '{"action":"user_signedup","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-04-25 12:14:12.500581+00', ''),
	('00000000-0000-0000-0000-000000000000', '414cce27-7084-4759-98ea-b8855c21802b', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:14:25.486333+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef6253af-ff7e-4024-ad25-1de577b5cf33', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:17:41.383165+00', ''),
	('00000000-0000-0000-0000-000000000000', '351d32de-e8cc-4363-a058-c59ea08e1ed5', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:18:43.186668+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd31f2e2-5f80-45e1-81db-dc6e818b9f12', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:19:08.237426+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b06f3c2-e23e-438a-911f-1101744a8aa9', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:20:45.912833+00', ''),
	('00000000-0000-0000-0000-000000000000', '5de1892f-9a20-4c2d-842d-8830cb664317', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:23:34.616981+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ccfb5de-d513-4444-8e8e-a799b33762f3', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:24:10.097624+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee44e2a9-0020-46c3-b299-ff5c9d625aa2', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:24:39.285644+00', ''),
	('00000000-0000-0000-0000-000000000000', '171b2c8f-732c-466f-a7ec-bd999c115279', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:26:20.664216+00', ''),
	('00000000-0000-0000-0000-000000000000', '26939cd0-eef3-4b99-b3bb-9921e6c85b8b', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:27:05.443185+00', ''),
	('00000000-0000-0000-0000-000000000000', '538c0f86-cfc3-46d4-a49e-bc9a8a72b42d', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:28:04.684907+00', ''),
	('00000000-0000-0000-0000-000000000000', '06b01be8-95a4-4541-be41-c0be99d55e18', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:28:15.163113+00', ''),
	('00000000-0000-0000-0000-000000000000', '127e7994-79c9-495e-9e15-da580d0c55fc', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:30:14.848015+00', ''),
	('00000000-0000-0000-0000-000000000000', '8651c207-ad96-4607-be36-1d895ee8cff7', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:30:22.518891+00', ''),
	('00000000-0000-0000-0000-000000000000', '48d8e7c3-a42a-4649-9e03-2d358f693b2d', '{"action":"login","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 12:32:20.099094+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f214e3c0-41df-4205-969a-eb2936c3a817', '{"action":"logout","actor_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 12:32:38.168537+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe6d0b61-54bf-4172-bcbe-4c7523439509', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"e338ff93-0cf2-4a83-9ed5-e45e7fe97d68","user_phone":""}}', '2025-04-25 14:56:51.391114+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f09bfda-f824-489d-857d-ca47a7c25201', '{"action":"user_confirmation_requested","actor_id":"1bfd357e-cb71-4ea7-b697-6513e32386f8","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 14:58:15.77795+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b14f12a-65e7-4cdf-8686-7b78fa6616a2', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"1bfd357e-cb71-4ea7-b697-6513e32386f8","user_phone":""}}', '2025-04-25 14:59:10.35956+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c576ad8-d0f7-4c5d-8534-8b1975fcfc06', '{"action":"user_confirmation_requested","actor_id":"b2f90f79-1b6e-4730-8052-a8ffd3128fbd","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 14:59:55.387336+00', ''),
	('00000000-0000-0000-0000-000000000000', '89c1d0cc-7a32-4f38-9dc3-46fe520d7ad0', '{"action":"user_confirmation_requested","actor_id":"b2f90f79-1b6e-4730-8052-a8ffd3128fbd","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 15:01:16.251069+00', ''),
	('00000000-0000-0000-0000-000000000000', '506271c3-f4dc-4ca6-b968-0ce50ba31bbd', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"b2f90f79-1b6e-4730-8052-a8ffd3128fbd","user_phone":""}}', '2025-04-25 15:02:17.130138+00', ''),
	('00000000-0000-0000-0000-000000000000', '04226939-e99d-49e2-8ac3-bd2c230f0b3f', '{"action":"user_confirmation_requested","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 15:41:07.949943+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b891f714-c9b0-49e0-9b39-9ac58d0a70a7', '{"action":"user_confirmation_requested","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:20:40.010903+00', ''),
	('00000000-0000-0000-0000-000000000000', '9272c085-fd09-4710-b1e5-2cb2851a231c', '{"action":"user_signedup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-04-25 17:27:43.421681+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1145992-089b-4394-a2f8-9c73a47a5236', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 17:32:31.879448+00', ''),
	('00000000-0000-0000-0000-000000000000', '1a7d5c5c-0b5c-4ee9-97d9-fbfdf6e33de2', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 17:40:50.139057+00', ''),
	('00000000-0000-0000-0000-000000000000', '9050f6e7-abb3-4302-959d-ddf486385333', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 17:48:13.556449+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ddfedde1-855f-4e4f-8766-bdc784b4f763', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:45.734786+00', ''),
	('00000000-0000-0000-0000-000000000000', '0931bfa6-874e-432d-be2c-ee0d90a31ef0', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:53.427016+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e97bb273-8f46-4efa-aa5e-524c65b42c8e', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:55.024332+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e079e7f-a325-4636-8bb0-54f6e4f2092b', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:55.201146+00', ''),
	('00000000-0000-0000-0000-000000000000', '48f90b2c-0e87-468d-b1ce-c8517b76ffce', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:55.387855+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e52ff6ce-2cf0-45b3-9616-c83ff5944e95', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:55.53878+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5c83133-3ad0-49e8-9d2d-991339122809', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:50:55.711028+00', ''),
	('00000000-0000-0000-0000-000000000000', '97d05689-60fa-4ac1-a5be-d4939edb0dc0', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:51:30.573287+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a8cf196-e2a3-4886-95a4-049541e0f633', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:51:34.435448+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e50b0b06-cb93-4cea-8994-9a540ad32f5b', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:51:35.538463+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8374c1d-5ba1-417a-88b9-3c028de5ed57', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:51:46.001451+00', ''),
	('00000000-0000-0000-0000-000000000000', '317f42ef-3b6a-4509-8393-31a36e1c9cf9', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:51:46.188062+00', ''),
	('00000000-0000-0000-0000-000000000000', '08596969-0b27-48dd-92d5-2a838e995c08', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:51:46.370108+00', ''),
	('00000000-0000-0000-0000-000000000000', '316017d0-9bf0-4443-9c9d-2dad20aad4c1', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:49.847743+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8eaa38d-385c-46f8-8324-db6c83bee54f', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:49.853971+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e515830c-8850-42e5-bfda-9f8f70f94c1e', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:49.866929+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ffb9506f-3f2d-48a9-b7fb-781ea3ef4791', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:50.041906+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f45a0e3-3f02-4b6b-9ab4-9031b0d4882e', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:50.214669+00', ''),
	('00000000-0000-0000-0000-000000000000', '4270ae2f-cc75-452f-a774-544f1e0ae5f4', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:50.361108+00', ''),
	('00000000-0000-0000-0000-000000000000', '16b77529-1aae-4574-960e-51fe7757f573', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:53:50.538858+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec96f488-dc83-4282-92a2-b7d9430a6119', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:54:04.015366+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb1cfbf2-1672-44a7-aa50-91d2e943c8df', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:54:05.914269+00', ''),
	('00000000-0000-0000-0000-000000000000', '168a766f-e806-488a-8c4f-fa72a13b2bde', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:54:06.119145+00', ''),
	('00000000-0000-0000-0000-000000000000', '161203d9-ce76-425e-ac15-a6f0cdb38636', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:54:06.30155+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e43e740d-f0ba-4f1b-a484-a06e2f4d5cad', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:55:25.285036+00', ''),
	('00000000-0000-0000-0000-000000000000', '8e14cddc-8b19-420b-a764-1cbb488b49d7', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:55:25.955037+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9b539e4-be8e-495e-b273-7ea901434172', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:55:26.130627+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0ad442f-21ac-41c4-ba49-bfef793dedbe', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:55:26.323747+00', ''),
	('00000000-0000-0000-0000-000000000000', 'abc2d52d-03e7-4f00-83ff-c18d312ea893', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:55:26.520769+00', ''),
	('00000000-0000-0000-0000-000000000000', '28ea5a26-875c-417f-ac73-17a3fcfd7acc', '{"action":"user_repeated_signup","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-25 17:56:17.53262+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc5a8a23-ee9a-401c-9854-c766823684d9', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 17:58:07.398229+00', ''),
	('00000000-0000-0000-0000-000000000000', '738dd60d-e33a-4b14-bfd8-6f0f96e7d35f', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:04:11.284864+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b4ba311-319f-4506-877b-02dab91a6894', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:06:47.029991+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f1e187f-a169-4fb2-ac6a-b3d86b064474', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:10:14.66886+00', ''),
	('00000000-0000-0000-0000-000000000000', '059c4a0f-d291-49b2-8bef-da1e82bd8ab3', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:11:18.157191+00', ''),
	('00000000-0000-0000-0000-000000000000', '185662f4-a050-48f8-9067-9547f24cf763', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:12:48.487446+00', ''),
	('00000000-0000-0000-0000-000000000000', '3007df41-8d4e-47b9-a35e-ca23d6aa60f3', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:15:48.367388+00', ''),
	('00000000-0000-0000-0000-000000000000', '824d5f46-26aa-42c9-bef1-bcd012028500', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:24:12.855606+00', ''),
	('00000000-0000-0000-0000-000000000000', '59819487-66ee-4927-9103-2ac74ce0fc60', '{"action":"logout","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 18:32:38.408761+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6f0c013-bb9a-4fb8-8489-c7d0c09ebbcb', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:34:59.690148+00', ''),
	('00000000-0000-0000-0000-000000000000', '4fbc2e13-f6cd-4f9b-b447-cac2bfdf679d', '{"action":"logout","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 18:37:03.014915+00', ''),
	('00000000-0000-0000-0000-000000000000', '82d05081-02df-42c4-be32-879356b9859a', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:37:53.445806+00', ''),
	('00000000-0000-0000-0000-000000000000', '26237395-8fa6-4ddd-af2d-44ff3c31d7cf', '{"action":"logout","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 18:44:12.443625+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b81987d9-3378-47ae-b3a6-320bb2936a15', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 18:44:27.62473+00', ''),
	('00000000-0000-0000-0000-000000000000', '2efba3a9-a9a0-469a-ac99-a07c73459fde', '{"action":"logout","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 19:01:43.255079+00', ''),
	('00000000-0000-0000-0000-000000000000', '649937f8-cb6c-4aa1-9cfd-6154b86f6169', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 19:02:08.492137+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6d364aa-c751-4f5c-9110-a66b5e9f9d75', '{"action":"logout","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 19:02:17.872883+00', ''),
	('00000000-0000-0000-0000-000000000000', '87ecedea-06b5-49cd-b6d4-7dda939c0a01', '{"action":"login","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-25 19:02:45.113128+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef8d7b98-60e7-4870-8aed-78860437af36', '{"action":"logout","actor_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-25 19:02:55.997735+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c517ba1a-967b-4292-8f0e-4441184a668a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"8dc25835-e359-47e8-997a-552b0eacf0ce","user_phone":""}}', '2025-05-02 16:37:08.827578+00', ''),
	('00000000-0000-0000-0000-000000000000', '7dbee1a2-919e-4d73-ba67-6d6caa623179', '{"action":"user_confirmation_requested","actor_id":"fbd79048-4f68-41ef-b9bd-50ff3c0b39b0","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-02 17:07:03.650979+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a613df67-8282-45d0-b815-17aed6a4a857', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"fbd79048-4f68-41ef-b9bd-50ff3c0b39b0","user_phone":""}}', '2025-05-02 17:09:15.923357+00', ''),
	('00000000-0000-0000-0000-000000000000', '2fbcc186-22e2-44db-8969-0315f60927a7', '{"action":"user_confirmation_requested","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-02 17:10:07.734616+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da9ee999-b398-4f86-9be7-9260f2f204fe', '{"action":"user_confirmation_requested","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-02 17:12:12.777551+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5153bc5-b74e-4aee-9fe9-3504cccf042b', '{"action":"user_signedup","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-05-02 17:15:28.662158+00', ''),
	('00000000-0000-0000-0000-000000000000', '6aac6e23-81fe-4d15-ac6a-10e622aa55b0', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:15:59.029754+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4a9627d-7c5a-4c6b-8551-1b272d8ef2a8', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:16:16.25303+00', ''),
	('00000000-0000-0000-0000-000000000000', '342c9b50-5f6c-4d56-b07d-72f66a9bc66e', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:21:40.967324+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c5011a1-5856-49f5-80b1-5da8c6d72f06', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:22:35.894614+00', ''),
	('00000000-0000-0000-0000-000000000000', '40dbb2cf-675f-49ce-a0b1-39c4e4d7c86c', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:25:14.968733+00', ''),
	('00000000-0000-0000-0000-000000000000', '3420d069-e737-492a-a2d9-063a3ff0ced5', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:28:17.049309+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e802a11-1db3-4c7e-9a01-c6854a7e5835', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:32:03.797473+00', ''),
	('00000000-0000-0000-0000-000000000000', '51a72ef9-e033-4d13-b81f-4a8d2cd29fa7', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:32:31.831149+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1665811-58b9-4e0f-857a-28516d1601f6', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:33:39.554948+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b544bcc2-974f-4937-a130-b3038ec1798c', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:34:00.053479+00', ''),
	('00000000-0000-0000-0000-000000000000', '98a645a4-ee03-4866-af8a-10fcfaddccdd', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:42:17.689031+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3f3c016-5f46-4808-9680-c3dc8ba4e82a', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:42:31.090886+00', ''),
	('00000000-0000-0000-0000-000000000000', '9936788a-06f8-4349-a940-83a8fdb1cc68', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:44:52.926245+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e697bbc0-afe0-4979-a0f5-56a213db206d', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:45:12.596046+00', ''),
	('00000000-0000-0000-0000-000000000000', '09b5b129-8f7d-4543-88e3-92d1f806d823', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:46:41.421203+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cbe06014-095f-4854-b1c5-3d9ae679d053', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:46:48.621647+00', ''),
	('00000000-0000-0000-0000-000000000000', '7a3b68a9-22db-4045-b7a6-ac781f8040ca', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 17:51:21.570007+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c8819691-c45f-45cd-8b24-02c1b3748795', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 17:51:39.957544+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dadc404b-7826-447f-a5d4-57eae3a4b7f1', '{"action":"login","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 18:37:01.102647+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ea3417a-e4c1-42ed-b1e7-a0215283e95a', '{"action":"logout","actor_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 18:39:13.875107+00', ''),
	('00000000-0000-0000-0000-000000000000', '292797a9-4cea-4d99-9f48-21cb0e4b274a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jaipkapoor99@gmail.com","user_id":"ed305b57-8d1b-4426-b8ef-705656df7a3a","user_phone":""}}', '2025-05-02 18:48:30.166071+00', ''),
	('00000000-0000-0000-0000-000000000000', '64ea4ae5-4f09-49d8-aece-cdb3823d0bc3', '{"action":"user_signedup","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-05-02 18:49:11.392659+00', ''),
	('00000000-0000-0000-0000-000000000000', '70f74ee2-9d6e-4583-9d7a-3f8a0ccac698', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 18:49:11.396839+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe65659f-dfa0-4b83-a289-ad7ea06f02a8', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 18:49:31.573719+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1ecc131-c9c1-4ef4-a305-e0390f7350ee', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 18:51:12.422459+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c4be451-df1a-4626-9698-1cf630b71ba9', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 18:51:57.926276+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e99e1926-0896-4ac5-a2b2-3c896421783c', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 18:52:43.42951+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ca39c8c3-46fa-4c78-956b-f86e84a373f9', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 18:52:55.849143+00', ''),
	('00000000-0000-0000-0000-000000000000', '94e6aa31-3c50-4290-87a7-ef4b064b521f', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:01:51.859105+00', ''),
	('00000000-0000-0000-0000-000000000000', '6aa934ed-a97f-4e7e-bb66-41dba5eea43a', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:02:01.694691+00', ''),
	('00000000-0000-0000-0000-000000000000', '112e1137-1463-43e1-a3ff-a62a2793a16d', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:06:42.724293+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c29f6637-6db6-4065-922e-98f88cba35cd', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:06:57.162404+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cf53c1d-6abe-40f6-80e0-1e47b921d3fc', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:07:29.691276+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d7a82a3-5478-403c-95ea-7fc42061183d', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:07:39.858271+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b64aca3-0e32-48fa-98d0-f34a2f2daa8f', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:23:36.438912+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd166f519-c35b-4688-80c2-12a757bac9ab', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:23:48.155754+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cafd431b-3590-42a8-bc25-ec0241179b14', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:25:20.725136+00', ''),
	('00000000-0000-0000-0000-000000000000', '703c2181-fb40-41c8-9d06-43e97215da82', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:27:04.093807+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e925eec-4ab6-4ef0-bc85-f3c1f28d2ff0', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:30:42.911941+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a7fffc1-1b51-40b4-8e85-b1730dcf93f5', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:31:00.470763+00', ''),
	('00000000-0000-0000-0000-000000000000', '8124c7b5-7631-4382-9bee-5663d1221c5e', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:31:41.624247+00', ''),
	('00000000-0000-0000-0000-000000000000', '157ef5f1-d80d-4827-a2a6-e819c9c9f5fd', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:31:49.674111+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c80d350-d006-4452-8cb5-f1bdaf291ba9', '{"action":"login","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-02 19:36:51.272231+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e653bef6-68c9-413c-9cc9-6c6cb6e610b7', '{"action":"logout","actor_id":"d08a46d3-6ab8-4d59-b790-c2c1fa8d672b","actor_username":"jaipkapoor99@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-05-02 19:37:03.212849+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'd08a46d3-6ab8-4d59-b790-c2c1fa8d672b', 'authenticated', 'authenticated', 'jaipkapoor99@gmail.com', '$2a$10$cawDu2yhGLoy9j1etiJK.uG.4u.GukbGvQNSQ3HIz0iFn8ol64Wh6', '2025-05-02 18:49:11.393221+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-05-02 19:36:51.273224+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d08a46d3-6ab8-4d59-b790-c2c1fa8d672b", "email": "jaipkapoor99@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-05-02 18:49:11.370531+00', '2025-05-02 19:36:51.278226+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('d08a46d3-6ab8-4d59-b790-c2c1fa8d672b', 'd08a46d3-6ab8-4d59-b790-c2c1fa8d672b', '{"sub": "d08a46d3-6ab8-4d59-b790-c2c1fa8d672b", "email": "jaipkapoor99@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-05-02 18:49:11.389332+00', '2025-05-02 18:49:11.389394+00', '2025-05-02 18:49:11.389394+00', '50d33a69-6095-4e0d-bf18-a3e7c13e93b9');


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

INSERT INTO "public"."events" ("event_id", "name", "description", "start_time", "end_time", "created_at", "updated_at") VALUES
	(1, 'Captain America', 'Star Spangled Hero', '2025-04-07 06:39:12+00', '2025-04-07 06:39:18+00', '2025-04-07 06:38:47.73716+00', '2025-04-07 06:38:47.73716+00'),
	(2, 'Iron Man', 'Shellhead', '2025-04-07 06:46:13+00', '2025-04-07 06:46:15+00', '2025-04-07 06:45:41.045738+00', '2025-04-07 06:45:41.045738+00'),
	(3, 'Thor', 'The Warrior of Asgard', '2025-04-07 06:47:14+00', '2025-04-07 06:47:16+00', '2025-04-07 06:46:41.82268+00', '2025-04-07 06:46:41.82268+00'),
	(4, 'Daredevil', 'The Devil of Hell''s Kitchen', '2025-04-07 06:47:41+00', '2025-04-07 06:47:43+00', '2025-04-07 06:47:08.878974+00', '2025-04-07 06:47:08.878974+00');


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

INSERT INTO "public"."users" ("user_id", "address1", "address2", "location_id", "created_at", "updated_at", "supabase_id", "role", "address3") VALUES
	(15, '', NULL, NULL, '2025-05-02 18:49:12.222971+00', '2025-05-02 18:49:12.222971+00', 'd08a46d3-6ab8-4d59-b790-c2c1fa8d672b', 'customer', NULL);


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 56, true);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."customers_customer_id_seq"', 15, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_event_id_seq"', 4, true);


--
-- Name: events_venues_event_venue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_venues_event_venue_id_seq"', 1, false);


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
('Pro Kabaddi League Finals', 'The championship match of the Pro Kabaddi League.', '2025-10-04 19:00:00+05:30', '2025-10-04 21:00:00+05:30', 'https://images.unsplash.com/photo-1599587823438-a1a8ad3b66d7?q=80&w=2070&auto=format&fit=crop'),
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

-- Re-enabling RLS after seeding
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_venues ENABLE ROW LEVEL SECURITY;

COMMIT;

SET session_replication_role = 'origin';
