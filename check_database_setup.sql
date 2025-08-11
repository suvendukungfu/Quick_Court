-- CHECK DATABASE SETUP FOR OWNER DASHBOARD
-- Run this in Supabase SQL Editor

-- 1. Check if users table exists and has data
SELECT '=== USERS TABLE CHECK ===' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'facility_owner' THEN 1 END) as facility_owners,
    COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users;

-- 2. Check if facilities table exists and has data
SELECT '=== FACILITIES TABLE CHECK ===' as info;
SELECT 
    COUNT(*) as total_facilities,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_facilities,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_facilities,
    COUNT(CASE WHEN status = 'banned' THEN 1 END) as banned_facilities
FROM facilities;

-- 3. Check facilities by owner
SELECT '=== FACILITIES BY OWNER ===' as info;
SELECT 
    f.owner_id,
    u.full_name as owner_name,
    u.email as owner_email,
    COUNT(f.id) as facility_count
FROM facilities f
LEFT JOIN users u ON f.owner_id = u.id
GROUP BY f.owner_id, u.full_name, u.email
ORDER BY facility_count DESC;

-- 4. Check RLS policies for facilities table
SELECT '=== FACILITIES RLS POLICIES ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'facilities' AND schemaname = 'public';

-- 5. Test a simple facilities query
SELECT '=== TEST FACILITIES QUERY ===' as info;
SELECT 
    id,
    name,
    facility_type,
    status,
    owner_id,
    created_at
FROM facilities 
LIMIT 5;

-- 6. Check if there are any facility owners with facilities
SELECT '=== FACILITY OWNERS WITH FACILITIES ===' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role,
    COUNT(f.id) as facility_count
FROM users u
LEFT JOIN facilities f ON u.id = f.owner_id
WHERE u.role = 'facility_owner'
GROUP BY u.id, u.full_name, u.email, u.role
ORDER BY facility_count DESC;

-- 7. Check for any recent facilities
SELECT '=== RECENT FACILITIES ===' as info;
SELECT 
    name,
    facility_type,
    status,
    owner_id,
    created_at
FROM facilities 
ORDER BY created_at DESC 
LIMIT 10;
