-- CHECK EMAIL SETTINGS AND CONFIGURATION
-- Run this in Supabase SQL Editor

-- 1. Check if email confirmation is enabled
SELECT '=== EMAIL CONFIRMATION STATUS ===' as info;

-- Check auth.users table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
AND column_name IN ('email_confirmed_at', 'confirmation_token', 'confirmed_at')
ORDER BY ordinal_position;

-- 2. Check recent user registrations
SELECT '=== RECENT USER REGISTRATIONS ===' as info;
SELECT 
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Pending Confirmation'
    END as status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if there are any unconfirmed users
SELECT '=== UNCONFIRMED USERS ===' as info;
SELECT 
    COUNT(*) as unconfirmed_count
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 4. Manual email confirmation (if needed)
-- Uncomment and run this if you want to manually confirm a specific user
/*
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
*/

-- 5. Check RLS policies for users table
SELECT '=== USERS TABLE RLS POLICIES ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
