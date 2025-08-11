-- CHECK FACILITIES TABLE STATUS
-- Run this in Supabase SQL Editor

-- 1. Check if facilities table exists and has data
SELECT '=== FACILITIES TABLE STATUS ===' as info;

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facilities'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT 'Total facilities count:' as info, COUNT(*) as count FROM facilities;

-- Show sample facilities
SELECT 'Sample facilities:' as info;
SELECT id, name, facility_type, status, created_at FROM facilities LIMIT 5;

-- 2. Check if there are any facilities at all
SELECT '=== FACILITY DATA ANALYSIS ===' as info;

-- Check by status
SELECT 
    status,
    COUNT(*) as count
FROM facilities 
GROUP BY status;

-- Check by facility type
SELECT 
    facility_type,
    COUNT(*) as count
FROM facilities 
GROUP BY facility_type;

-- 3. Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'facilities';

-- 4. Test basic query
SELECT '=== TEST QUERY ===' as info;
SELECT * FROM facilities LIMIT 1;
