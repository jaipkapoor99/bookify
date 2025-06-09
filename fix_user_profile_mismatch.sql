-- Fix User Profile Mismatch
-- Run this in Supabase SQL Editor while logged in as the user having issues

-- Step 1: Check your current auth session
SELECT 
  'Your Current Session' as info,
  auth.uid() as your_auth_id,
  auth.email() as your_email;

-- Step 2: Check if your profile exists in public.users
SELECT 
  'Your Profile Check' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()
    ) THEN 'PROFILE EXISTS ✓'
    ELSE 'PROFILE MISSING ✗'
  END as profile_status,
  auth.uid() as looking_for_this_id;

-- Step 3: Show all public.users to see what's there
SELECT 
  'All Public Users' as info,
  user_id,
  email,
  supabase_id,
  created_at,
  CASE 
    WHEN supabase_id = auth.uid() THEN 'THIS IS YOU ✓'
    ELSE 'Other user'
  END as is_current_user
FROM public.users
ORDER BY created_at DESC;

-- Step 4: Show tickets that belong to existing users
SELECT 
  'Tickets by User' as info,
  u.email,
  u.supabase_id,
  COUNT(t.ticket_id) as ticket_count,
  CASE 
    WHEN u.supabase_id = auth.uid() THEN 'YOUR TICKETS ✓'
    ELSE 'Other user tickets'
  END as ownership
FROM public.users u
LEFT JOIN public.tickets t ON u.user_id = t.customer_id
GROUP BY u.user_id, u.email, u.supabase_id
ORDER BY ticket_count DESC;

-- Step 5: SOLUTION 1 - Create missing profile (only if you don't have one)
-- Uncomment if Step 2 shows 'PROFILE MISSING'
/*
INSERT INTO public.users (supabase_id, email, created_at, updated_at)
VALUES (
  auth.uid(),
  auth.email(),
  NOW(),
  NOW()
)
ON CONFLICT (supabase_id) DO NOTHING;
*/

-- Step 6: SOLUTION 2 - Update existing profile to match your auth ID
-- Only use if you have tickets but wrong supabase_id
-- Replace 'your-email@example.com' with your actual email
/*
UPDATE public.users 
SET supabase_id = auth.uid()
WHERE email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
  AND supabase_id IS DISTINCT FROM auth.uid();
*/

-- Step 7: Verify the fix worked
SELECT 
  'Fix Verification' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()
    ) THEN 'SUCCESS ✓ - Profile now exists'
    ELSE 'STILL BROKEN ✗ - Try manual fix'
  END as fix_status; 