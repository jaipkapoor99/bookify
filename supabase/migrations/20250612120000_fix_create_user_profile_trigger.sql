-- Correct the create_user_profile function to align with the users table schema.
-- It should not try to insert an "email" column, which does not exist.
-- It should insert the supabase_id (auth.users.id) and a default name.
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (supabase_id, name)
  VALUES (NEW.id, NEW.email); -- Use email as the default name
  RETURN NEW;
END;
$$; 