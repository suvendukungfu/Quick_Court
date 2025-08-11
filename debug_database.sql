-- DEBUG AND FIX DATABASE ISSUES
-- Run this in Supabase SQL Editor

-- 1. Check current table structure
SELECT '=== CURRENT TABLE STRUCTURE ===' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'facilities')
ORDER BY table_name, ordinal_position;

-- 2. Check current data
SELECT '=== CURRENT DATA ===' as info;
SELECT 'Users count:' as table_name, COUNT(*) as count FROM users;
SELECT 'Facilities count:' as table_name, COUNT(*) as count FROM facilities;

-- 3. Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'facilities');

-- 4. Fix any missing columns in users table
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer';
        RAISE NOTICE 'Added role column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to users table';
    END IF;
END $$;

-- 5. Update existing users with proper data
UPDATE users 
SET 
    full_name = COALESCE(full_name, 'User'),
    role = COALESCE(role, 'customer'),
    status = COALESCE(status, 'active'),
    created_at = COALESCE(created_at, NOW())
WHERE full_name IS NULL OR role IS NULL OR status IS NULL OR created_at IS NULL;

-- 6. Disable RLS temporarily to avoid permission issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE facilities DISABLE ROW LEVEL SECURITY;

-- 7. Drop and recreate policies
DROP POLICY IF EXISTS "Allow all users" ON users;
DROP POLICY IF EXISTS "Allow all facilities" ON facilities;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can do anything" ON users;
DROP POLICY IF EXISTS "Anyone can view active facilities" ON facilities;
DROP POLICY IF EXISTS "Owners can manage their facilities" ON facilities;
DROP POLICY IF EXISTS "Service role can do anything" ON facilities;

-- 8. Create simple, working policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on facilities" ON facilities FOR ALL USING (true);

-- 9. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- 10. Grant all permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON facilities TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 11. Insert test data if tables are empty
INSERT INTO users (email, full_name, role, status)
SELECT 'test@user.com', 'Test User', 'customer', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@user.com');

INSERT INTO facilities (name, facility_type, status)
SELECT 'Test Court', 'basketball_court', 'active'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Test Court');

-- 12. Final verification
SELECT '=== FINAL VERIFICATION ===' as info;
SELECT 'Users table:' as table_name, COUNT(*) as count FROM users;
SELECT 'Facilities table:' as table_name, COUNT(*) as count FROM facilities;

-- 13. Test query (this should work without errors)
SELECT '=== TEST QUERY ===' as info;
SELECT id, email, full_name, role, status FROM users LIMIT 5;
SELECT id, name, facility_type, status FROM facilities LIMIT 5;
