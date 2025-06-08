CREATE POLICY "Allow authenticated users to insert their own tickets"
ON public.tickets
FOR INSERT
WITH CHECK ((
  SELECT auth.uid()
) = (
  SELECT supabase_id FROM public.users WHERE id = tickets.customer_id
));
