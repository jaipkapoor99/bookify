-- Fix RLS Policy for Users Table
-- This allows authenticated users to insert their own profile

-- Check current policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Add policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (supabase_id = auth.uid());

-- Add policy to allow users to read their own profile  
CREATE POLICY "Users can read their own profile" ON public.users
FOR SELECT
TO authenticated
USING (supabase_id = auth.uid());

-- Add policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE
TO authenticated
USING (supabase_id = auth.uid())
WITH CHECK (supabase_id = auth.uid());

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users'; 