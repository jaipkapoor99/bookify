-- Debug User Profile Issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- Step 1: Check current auth user (if logged in to dashboard)
SELECT 
  'Current Auth Session' as check_type,
  auth.uid() as current_auth_id,
  auth.email() as current_auth_email;

-- Step 2: Check all users in auth.users table
SELECT 
  'Auth Users Count' as check_type,
  COUNT(*) as user_count
FROM auth.users;

-- Step 3: Check all users in public.users table  
SELECT 
  'Public Users Count' as check_type,
  COUNT(*) as user_count
FROM public.users;

-- Step 4: Check if there's a mismatch between auth and public users
SELECT 
  'Auth vs Public Users' as check_type,
  au.id as auth_id,
  au.email as auth_email,
  au.created_at as auth_created,
  pu.user_id as public_user_id,
  pu.supabase_id as public_supabase_id,
  pu.email as public_email,
  pu.created_at as public_created,
  CASE 
    WHEN pu.supabase_id IS NULL THEN 'MISSING PUBLIC PROFILE'
    WHEN au.id != pu.supabase_id THEN 'ID MISMATCH'
    ELSE 'MATCHED'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.supabase_id
ORDER BY au.created_at DESC;

-- Step 5: Check tickets and their user associations
SELECT 
  'Tickets with User Info' as check_type,
  t.ticket_id,
  t.customer_id,
  t.created_at as ticket_created,
  pu.email as customer_email,
  pu.supabase_id as customer_supabase_id,
  e.name as event_name
FROM public.tickets t
LEFT JOIN public.users pu ON t.customer_id = pu.user_id  
LEFT JOIN public.events_venues ev ON t.events_venues_id = ev.event_venue_id
LEFT JOIN public.events e ON ev.event_id = e.event_id
ORDER BY t.created_at DESC
LIMIT 10;

-- Step 6: Check if user profile creation trigger exists
SELECT 
  'Trigger Check' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%user%profile%'
  OR action_statement LIKE '%users%';

-- Step 7: Fix suggestion - Create missing user profile
-- UNCOMMENT AND MODIFY THE EMAIL BELOW IF YOU WANT TO CREATE A PROFILE MANUALLY

/*
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.users (supabase_id, email, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.supabase_id = au.id
  );
*/ 