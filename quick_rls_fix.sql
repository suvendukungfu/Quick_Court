-- Quick Fix for Users Table RLS Infinite Recursion
-- Run this in your Supabase SQL editor

-- Step 1: Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role bypass" ON users;

-- Step 3: Create only essential, non-recursive policies
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT 
    WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT 
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Service role bypass" ON users
    FOR ALL 
    USING (auth.role() = 'service_role');

-- Step 4: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify
SELECT 'Policies created:' as info;
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

SELECT 'RLS enabled:' as info;
SELECT rowsecurity FROM pg_tables WHERE tablename = 'users';
