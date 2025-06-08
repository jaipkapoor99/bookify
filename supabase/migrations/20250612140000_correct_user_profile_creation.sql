-- Step 1: Add the 'email' column to the public.users table.
-- We use "IF NOT EXISTS" to make the migration re-runnable.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Correct the create_user_profile function to use the new email column.
-- This function will now correctly create a corresponding record in public.users
-- whenever a new user is created in auth.users.
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the new user's auth ID and email into the public users table.
  INSERT INTO public.users (supabase_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$; 