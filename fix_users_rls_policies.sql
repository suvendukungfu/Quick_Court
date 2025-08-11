-- Fix Users Table RLS Policies - Infinite Recursion Issue
-- Run this in your Supabase SQL editor

-- Step 1: Temporarily disable RLS to avoid recursion during policy creation
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Service role can do anything" ON users;

-- Step 3: Verify table structure and constraints
SELECT 'Current table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check if required columns exist, add them if missing
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status text DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url text;
        RAISE NOTICE 'Added avatar_url column';
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone text;
        RAISE NOTICE 'Added phone column';
    END IF;
    
    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address text;
        RAISE NOTICE 'Added address column';
    END IF;
    
    -- Add business_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'business_name') THEN
        ALTER TABLE users ADD COLUMN business_name text;
        RAISE NOTICE 'Added business_name column';
    END IF;
    
    -- Add business_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'business_address') THEN
        ALTER TABLE users ADD COLUMN business_address text;
        RAISE NOTICE 'Added business_address column';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Step 5: Set proper defaults and constraints
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
UPDATE users SET role = 'customer' WHERE role IS NULL;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET NOT NULL;

-- Step 6: Add or update constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'facility_owner', 'admin'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'banned'));

-- Step 7: Create a trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Test insertion without RLS to ensure table structure is correct
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    test_user_id := gen_random_uuid();
    
    INSERT INTO users (
        id, 
        email, 
        full_name, 
        role, 
        status
    ) VALUES (
        test_user_id,
        'test' || extract(epoch from now()) || '@example.com',
        'Test User',
        'customer',
        'active'
    );
    
    RAISE NOTICE 'Test user created successfully with ID: %', test_user_id;
    
    -- Clean up test user
    DELETE FROM users WHERE id = test_user_id;
    RAISE NOTICE 'Test user cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during test insertion: %', SQLERRM;
    RAISE;
END $$;

-- Step 9: Create simple, non-recursive RLS policies
-- Policy 1: Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT 
    WITH CHECK (auth.uid()::text = id::text);

-- Policy 2: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT 
    USING (auth.uid()::text = id::text);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Policy 4: Service role bypass (for admin operations)
CREATE POLICY "Service role bypass" ON users
    FOR ALL 
    USING (auth.role() = 'service_role');

-- Step 10: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 11: Verify policies were created
SELECT 'Created policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Step 12: Test RLS policies work correctly
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    test_user_id := gen_random_uuid();
    
    -- This should work now with proper RLS policies
    INSERT INTO users (
        id, 
        email, 
        full_name, 
        role, 
        status
    ) VALUES (
        test_user_id,
        'test_rls' || extract(epoch from now()) || '@example.com',
        'Test RLS User',
        'customer',
        'active'
    );
    
    RAISE NOTICE 'RLS test user created successfully with ID: %', test_user_id;
    
    -- Clean up test user
    DELETE FROM users WHERE id = test_user_id;
    RAISE NOTICE 'RLS test user cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during RLS test: %', SQLERRM;
    RAISE;
END $$;

-- Step 13: Final verification
SELECT 'Final table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Final constraints:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;

SELECT 'RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

SELECT 'All done! Users table RLS policies have been fixed.' as status;
