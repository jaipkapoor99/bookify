-- Add the 'name' column to the public.users table to align it with the
-- create_user_profile trigger function, which expects this column to exist.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT; 