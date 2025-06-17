-- Enable RLS on the tickets table, if not already enabled.
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy if it exists, then recreate it.
-- This makes the migration script idempotent and safe to re-run.
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT user_id FROM public.users WHERE supabase_id = auth.uid()
  )
);
