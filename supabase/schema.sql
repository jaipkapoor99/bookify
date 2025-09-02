

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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."Role" AS ENUM (
    'customer',
    'admin'
);


ALTER TYPE "public"."Role" OWNER TO "postgres";


CREATE TYPE "public"."item_type" AS ENUM (
    'saree',
    'suit',
    'dupatta'
);


ALTER TYPE "public"."item_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_add_gmail_suffix"() RETURNS "trigger"
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


ALTER FUNCTION "public"."auto_add_gmail_suffix"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."book_ticket"("p_event_venue_id" bigint, "p_quantity" integer DEFAULT 1) RETURNS "void"
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


ALTER FUNCTION "public"."book_ticket"("p_event_venue_id" bigint, "p_quantity" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_profile"() RETURNS "trigger"
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


ALTER FUNCTION "public"."create_user_profile"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "ticket_id" integer NOT NULL,
    "customer_id" integer NOT NULL,
    "event_venue_id" bigint NOT NULL,
    "ticket_price" bigint NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_bookings"() RETURNS SETOF "public"."tickets"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT *
  FROM public.tickets
  WHERE customer_id IN (
    SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."get_my_bookings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_bookings_with_details"("p_customer_id" integer) RETURNS TABLE("ticket_id" integer, "customer_id" integer, "event_venue_id" integer, "ticket_price" integer, "quantity" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "event_venue_date" "date", "event_venue_price" integer, "no_of_tickets" integer, "venue_name" "text", "pincode" "text", "event_name" "text", "event_description" "text", "event_start_time" timestamp with time zone, "event_end_time" timestamp with time zone, "event_image_url" "text", "event_image_path" "text")
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


ALTER FUNCTION "public"."get_my_bookings_with_details"("p_customer_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
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


ALTER TABLE "public"."events" OWNER TO "postgres";


ALTER TABLE "public"."events" ALTER COLUMN "event_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."events_venues" (
    "event_venue_id" bigint NOT NULL,
    "event_id" bigint NOT NULL,
    "venue_id" bigint NOT NULL,
    "event_venue_date" "date" NOT NULL,
    "no_of_tickets" integer DEFAULT 0 NOT NULL,
    "price" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."events_venues" OWNER TO "postgres";


ALTER TABLE "public"."events_venues" ALTER COLUMN "event_venue_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_venues_event_venue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."locations" (
    "location_id" bigint NOT NULL,
    "pincode" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


ALTER TABLE "public"."locations" ALTER COLUMN "location_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."locations_location_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."tickets" ALTER COLUMN "ticket_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tickets_ticket_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
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


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE "public"."users" ALTER COLUMN "user_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."venues" (
    "venue_id" bigint NOT NULL,
    "venue_name" "text" NOT NULL,
    "location_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."venues" OWNER TO "postgres";


ALTER TABLE "public"."venues" ALTER COLUMN "venue_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."venues_venue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."events_venues"
    ADD CONSTRAINT "events_venues_pkey" PRIMARY KEY ("event_venue_id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("ticket_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_supabase_id_key" UNIQUE ("supabase_id");



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_pkey" PRIMARY KEY ("venue_id");



ALTER TABLE ONLY "public"."events_venues"
    ADD CONSTRAINT "events_venues_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");



ALTER TABLE ONLY "public"."events_venues"
    ADD CONSTRAINT "events_venues_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("venue_id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_event_venue_id_fkey" FOREIGN KEY ("event_venue_id") REFERENCES "public"."events_venues"("event_venue_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id");



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id");



CREATE POLICY "Allow public read access to events" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to events_venues" ON "public"."events_venues" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to locations" ON "public"."locations" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to venues" ON "public"."venues" FOR SELECT USING (true);



CREATE POLICY "Allow service role to manage users" ON "public"."users" USING (true);



CREATE POLICY "Service role can manage tickets" ON "public"."tickets" USING (true);



CREATE POLICY "Users can create tickets" ON "public"."tickets" FOR INSERT WITH CHECK (("customer_id" IN ( SELECT "users"."user_id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = "auth"."uid"()))));



CREATE POLICY "Users can read own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "supabase_id"));



CREATE POLICY "Users can read own tickets" ON "public"."tickets" FOR SELECT USING (("customer_id" IN ( SELECT "users"."user_id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "supabase_id"));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events_venues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venues" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TYPE "public"."item_type" TO "anon";
GRANT ALL ON TYPE "public"."item_type" TO "authenticated";



GRANT ALL ON FUNCTION "public"."auto_add_gmail_suffix"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_add_gmail_suffix"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_add_gmail_suffix"() TO "service_role";



GRANT ALL ON FUNCTION "public"."book_ticket"("p_event_venue_id" bigint, "p_quantity" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."book_ticket"("p_event_venue_id" bigint, "p_quantity" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."book_ticket"("p_event_venue_id" bigint, "p_quantity" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_bookings"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_bookings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_bookings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_bookings_with_details"("p_customer_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_bookings_with_details"("p_customer_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_bookings_with_details"("p_customer_id" integer) TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."events_event_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."events_event_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."events_event_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."events_venues" TO "anon";
GRANT ALL ON TABLE "public"."events_venues" TO "authenticated";
GRANT ALL ON TABLE "public"."events_venues" TO "service_role";



GRANT ALL ON SEQUENCE "public"."events_venues_event_venue_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."events_venues_event_venue_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."events_venues_event_venue_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."locations_location_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."locations_location_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."locations_location_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tickets_ticket_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tickets_ticket_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tickets_ticket_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_user_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."venues" TO "anon";
GRANT ALL ON TABLE "public"."venues" TO "authenticated";
GRANT ALL ON TABLE "public"."venues" TO "service_role";



GRANT ALL ON SEQUENCE "public"."venues_venue_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."venues_venue_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."venues_venue_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
