-- Check RLS policies on tables used in events query
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd as command,
    qual as condition
FROM pg_policies 
WHERE tablename IN ('events', 'events_venues', 'venues', 'locations')
ORDER BY tablename, policyname;

-- Also check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('events', 'events_venues', 'venues', 'locations')
ORDER BY tablename; 