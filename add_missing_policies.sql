-- Add missing RLS policies for users and tickets tables
-- Run this after creating the base schema

-- Policies for users table
CREATE POLICY "Allow service role to manage users" ON "public"."users"
  FOR ALL USING (true);

CREATE POLICY "Users can read own profile" ON "public"."users" 
  FOR SELECT USING (auth.uid() = supabase_id);

CREATE POLICY "Users can update own profile" ON "public"."users" 
  FOR UPDATE USING (auth.uid() = supabase_id);

-- Policies for tickets table  
CREATE POLICY "Users can read own tickets" ON "public"."tickets"
  FOR SELECT USING (
    customer_id IN (
      SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tickets" ON "public"."tickets"
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
    )
  );

-- Allow service role full access to tickets (for RPC functions)
CREATE POLICY "Service role can manage tickets" ON "public"."tickets"
  FOR ALL USING (true);

-- Ensure the service role can bypass RLS for all operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role; 