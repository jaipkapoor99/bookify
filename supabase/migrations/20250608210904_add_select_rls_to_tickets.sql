CREATE POLICY "Allow users to view their own tickets"
ON public.tickets
FOR SELECT
USING ((
  SELECT auth.uid()
) = (
  SELECT supabase_id FROM public.users WHERE user_id = tickets.customer_id
));
