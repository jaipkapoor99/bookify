-- =================================================================
-- Create User Profile on Signup Trigger
-- =================================================================
-- This script ensures that a public user profile is automatically
-- created whenever a new user signs up via any method (email, OAuth, etc.).
--
-- It does this by creating a trigger on the `auth.users` table that
-- executes a function to copy the new user's details into `public.users`.
-- =================================================================

-- Step 1: Define the function to create a user profile.
-- This function will be called by the trigger. It takes the new user's
-- ID and name from the `auth.users` table and inserts it into `public.users`.
-- The user's full name is extracted from the raw metadata provided by OAuth.
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (supabase_id, name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Step 2: Create the trigger that fires after a new user is created.
-- This ensures that for every new entry in `auth.users`, the `create_user_profile`
-- function is automatically called to create the corresponding public profile.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile(); 