-- Drop the old function if it exists to avoid conflicts.
DROP FUNCTION IF EXISTS public.get_my_bookings();

-- Create the new function to fetch bookings for the currently authenticated user.
-- SECURITY DEFINER allows the function to bypass RLS policies and run with the permissions
-- of the user that defined it (postgres), ensuring consistent data access.
CREATE OR REPLACE FUNCTION public.get_my_bookings()
RETURNS SETOF public.tickets
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.tickets
  WHERE customer_id IN (
    SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
  );
$$; 