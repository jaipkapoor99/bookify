-- MANUAL FIX for User Profile Mismatch
-- This will identify the exact problem and provide a targeted fix

-- Step 1: Show your current auth info
SELECT 
  'YOUR CURRENT AUTH INFO' as section,
  auth.uid() as your_current_auth_id,
  auth.email() as your_current_email;

-- Step 2: Show ALL user profiles with their details
SELECT 
  'ALL USER PROFILES' as section,
  user_id,
  email,
  supabase_id,
  created_at,
  -- Show which profile likely belongs to you based on email
  CASE 
    WHEN email = auth.email() THEN 'THIS IS YOUR EMAIL ➤'
    ELSE ''
  END as email_match
FROM public.users
ORDER BY created_at DESC;

-- Step 3: Show which profiles have tickets
SELECT 
  'PROFILES WITH TICKETS' as section,
  u.user_id,
  u.email,
  u.supabase_id,
  COUNT(t.ticket_id) as ticket_count,
  CASE 
    WHEN u.email = auth.email() THEN 'YOUR EMAIL ➤'
    ELSE ''
  END as email_match
FROM public.users u
LEFT JOIN public.tickets t ON u.user_id = t.customer_id
GROUP BY u.user_id, u.email, u.supabase_id
HAVING COUNT(t.ticket_id) > 0
ORDER BY ticket_count DESC;

-- Step 4: IDENTIFY THE PROBLEM
SELECT 
  'PROBLEM DIAGNOSIS' as section,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()) 
    THEN 'Profile with your auth ID exists (should not see this)'
    WHEN EXISTS (SELECT 1 FROM public.users WHERE email = auth.email())
    THEN 'Profile with your email exists but wrong supabase_id - FIXABLE ✓'
    ELSE 'No profile found with your email - need to create one'
  END as diagnosis;

-- Step 5: THE FIX - Update the profile with your email to use your current auth ID
-- This is the most likely solution
UPDATE public.users 
SET supabase_id = auth.uid()
WHERE email = auth.email()
  AND supabase_id != auth.uid();

-- Step 6: If no profile exists with your email, create one
INSERT INTO public.users (supabase_id, email, created_at, updated_at)
SELECT 
  auth.uid(),
  auth.email(),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = auth.email()
);

-- Step 7: VERIFY THE FIX
SELECT 
  'VERIFICATION AFTER FIX' as section,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid() AND email = auth.email()
    ) THEN 'SUCCESS ✓ - Profile now matches your auth session'
    ELSE 'STILL BROKEN ✗ - Contact support'
  END as final_status,
  auth.uid() as your_auth_id,
  auth.email() as your_email;

-- Step 8: Show your tickets (should work now)
SELECT 
  'YOUR TICKETS AFTER FIX' as section,
  u.user_id,
  u.email,
  u.supabase_id,
  COUNT(t.ticket_id) as your_ticket_count
FROM public.users u
LEFT JOIN public.tickets t ON u.user_id = t.customer_id
WHERE u.supabase_id = auth.uid()
GROUP BY u.user_id, u.email, u.supabase_id; 