--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

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
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."Role" AS ENUM (
    'customer',
    'admin'
);


--
-- Name: item_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."item_type" AS ENUM (
    'saree',
    'suit',
    'dupatta'
);


--
-- Name: auto_add_gmail_suffix(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."auto_add_gmail_suffix"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.email NOT LIKE '%@%' THEN
    NEW.email := NEW.email || '@gmail.com';
  ELSIF NEW.email NOT LIKE '%@gmail.com' THEN
    RAISE EXCEPTION 'Invalid email domain. Only @gmail.com addresses are allowed.';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: book_ticket(bigint, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."book_ticket"("p_event_venue_id" bigint, "p_quantity" integer DEFAULT 1) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_auth_uuid UUID;
  v_internal_user_id INT;
  v_venue_details RECORD;
BEGIN
  -- Validate quantity
  IF p_quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1';
  END IF;

  -- Get the current user's auth UUID from the session
  SELECT auth.uid() INTO v_auth_uuid;
  IF v_auth_uuid IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated.';
  END IF;

  -- Get the internal user_id
  SELECT user_id INTO v_internal_user_id
  FROM public.users
  WHERE supabase_id = v_auth_uuid
  LIMIT 1;

  -- Verify a user profile was found
  IF v_internal_user_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found. Please complete your profile before booking.';
  END IF;

  -- Check for ticket availability and lock the row
  SELECT * INTO v_venue_details
  FROM public.events_venues
  WHERE event_venue_id = p_event_venue_id FOR UPDATE;

  IF v_venue_details.event_venue_id IS NULL THEN
      RAISE EXCEPTION 'Event venue not found.';
  END IF;

  IF v_venue_details.no_of_tickets < p_quantity THEN
    RAISE EXCEPTION 'Not enough tickets available. Only % tickets remaining.', v_venue_details.no_of_tickets;
  END IF;

  -- Decrement the ticket count
  UPDATE public.events_venues
  SET no_of_tickets = no_of_tickets - p_quantity
  WHERE event_venue_id = p_event_venue_id;

  -- Create the ticket record
  INSERT INTO public.tickets(customer_id, event_venue_id, ticket_price, quantity)
  VALUES (v_internal_user_id, p_event_venue_id, v_venue_details.price, p_quantity);

END;
$$;


--
-- Name: create_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (supabase_id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."tickets" (
    "ticket_id" integer NOT NULL,
    "customer_id" integer NOT NULL,
    "event_venue_id" bigint NOT NULL,
    "ticket_price" bigint NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: get_my_bookings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_my_bookings"() RETURNS SETOF "public"."tickets"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT *
  FROM public.tickets
  WHERE customer_id IN (
    SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
  );
$$;


--
-- Name: get_my_bookings_with_details(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_my_bookings_with_details"("p_customer_id" integer) RETURNS TABLE("ticket_id" integer, "customer_id" integer, "event_venue_id" integer, "ticket_price" integer, "quantity" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "event_venue_date" "date", "event_venue_price" integer, "no_of_tickets" integer, "venue_name" "text", "pincode" "text", "event_name" "text", "event_description" "text", "event_start_time" timestamp with time zone, "event_end_time" timestamp with time zone, "event_image_url" "text", "event_image_path" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT 
    t.ticket_id,
    t.customer_id,
    t.event_venue_id,
    t.ticket_price,
    t.quantity,
    t.created_at,
    t.updated_at,
    ev.event_venue_date,
    ev.price as event_venue_price,
    ev.no_of_tickets,
    v.venue_name,
    l.pincode,
    e.name as event_name,
    e.description as event_description,
    e.start_time as event_start_time,
    e.end_time as event_end_time,
    e.image_url as event_image_url,
    e.image_path as event_image_path
  FROM public.tickets t
  INNER JOIN public.events_venues ev ON t.event_venue_id = ev.event_venue_id
  INNER JOIN public.venues v ON ev.venue_id = v.venue_id
  INNER JOIN public.events e ON ev.event_id = e.event_id
  LEFT JOIN public.locations l ON v.location_id = l.location_id
  WHERE t.customer_id = p_customer_id
  ORDER BY t.created_at DESC;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."events" (
    "event_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "image_url" "text",
    "image_path" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE "public"."events" ALTER COLUMN "event_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: events_venues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."events_venues" (
    "event_venue_id" bigint NOT NULL,
    "event_id" bigint NOT NULL,
    "venue_id" bigint NOT NULL,
    "event_venue_date" "date" NOT NULL,
    "no_of_tickets" integer DEFAULT 0 NOT NULL,
    "price" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: events_venues_event_venue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE "public"."events_venues" ALTER COLUMN "event_venue_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_venues_event_venue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."locations" (
    "location_id" bigint NOT NULL,
    "pincode" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: locations_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE "public"."locations" ALTER COLUMN "location_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."locations_location_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE "public"."tickets" ALTER COLUMN "ticket_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tickets_ticket_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
    "user_id" integer NOT NULL,
    "supabase_id" "uuid",
    "name" "text",
    "email" "text",
    "address1" "text",
    "address2" "text",
    "address3" "text",
    "location_id" bigint,
    "role" "public"."Role" DEFAULT 'customer'::"public"."Role",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE "public"."users" ALTER COLUMN "user_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: venues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."venues" (
    "venue_id" bigint NOT NULL,
    "venue_name" "text" NOT NULL,
    "location_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: venues_venue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE "public"."venues" ALTER COLUMN "venue_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."venues_venue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("event_id");


--
-- Name: events_venues events_venues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."events_venues"
    ADD CONSTRAINT "events_venues_pkey" PRIMARY KEY ("event_venue_id");


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id");


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("ticket_id");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");


--
-- Name: users users_supabase_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_supabase_id_key" UNIQUE ("supabase_id");


--
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_pkey" PRIMARY KEY ("venue_id");


--
-- Name: events_venues events_venues_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."events_venues"
    ADD CONSTRAINT "events_venues_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");


--
-- Name: events_venues events_venues_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."events_venues"
    ADD CONSTRAINT "events_venues_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("venue_id");


--
-- Name: tickets tickets_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("user_id");


--
-- Name: tickets tickets_event_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_event_venue_id_fkey" FOREIGN KEY ("event_venue_id") REFERENCES "public"."events_venues"("event_venue_id");


--
-- Name: users users_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id");


--
-- Name: venues venues_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id");


--
-- Name: events Allow public read access to events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to events" ON "public"."events" FOR SELECT USING (true);


--
-- Name: events_venues Allow public read access to events_venues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to events_venues" ON "public"."events_venues" FOR SELECT USING (true);


--
-- Name: locations Allow public read access to locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to locations" ON "public"."locations" FOR SELECT USING (true);


--
-- Name: venues Allow public read access to venues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to venues" ON "public"."venues" FOR SELECT USING (true);


--
-- Name: users Allow service role to manage users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow service role to manage users" ON "public"."users" USING (true);


--
-- Name: tickets Service role can manage tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage tickets" ON "public"."tickets" USING (true);


--
-- Name: tickets Users can create tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tickets" ON "public"."tickets" FOR INSERT WITH CHECK (("customer_id" IN ( SELECT "users"."user_id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = "auth"."uid"()))));


--
-- Name: users Users can read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "supabase_id"));


--
-- Name: tickets Users can read own tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own tickets" ON "public"."tickets" FOR SELECT USING (("customer_id" IN ( SELECT "users"."user_id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = "auth"."uid"()))));


--
-- Name: users Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "supabase_id"));


--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;

--
-- Name: events_venues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."events_venues" ENABLE ROW LEVEL SECURITY;

--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;

--
-- Name: tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

--
-- Name: venues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."venues" ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

