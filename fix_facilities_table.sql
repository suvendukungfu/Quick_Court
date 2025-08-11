-- FIX FACILITIES TABLE FOR FACILITY POSTING
-- Run this in Supabase SQL Editor

-- 1. Check current facilities table structure
SELECT '=== CURRENT FACILITIES TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facilities'
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
DO $$
BEGIN
    -- Add contact_phone if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'contact_phone') THEN
        ALTER TABLE facilities ADD COLUMN contact_phone TEXT;
        RAISE NOTICE 'Added contact_phone column to facilities table';
    END IF;
    
    -- Add contact_email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'contact_email') THEN
        ALTER TABLE facilities ADD COLUMN contact_email TEXT;
        RAISE NOTICE 'Added contact_email column to facilities table';
    END IF;
    
    -- Add website_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'website_url') THEN
        ALTER TABLE facilities ADD COLUMN website_url TEXT;
        RAISE NOTICE 'Added website_url column to facilities table';
    END IF;
    
    -- Add country if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'country') THEN
        ALTER TABLE facilities ADD COLUMN country TEXT DEFAULT 'USA';
        RAISE NOTICE 'Added country column to facilities table';
    END IF;
    
    -- Add zip_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'zip_code') THEN
        ALTER TABLE facilities ADD COLUMN zip_code TEXT;
        RAISE NOTICE 'Added zip_code column to facilities table';
    END IF;
    
    -- Add featured if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'featured') THEN
        ALTER TABLE facilities ADD COLUMN featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added featured column to facilities table';
    END IF;
END $$;

-- 3. Verify final structure
SELECT '=== FINAL FACILITIES TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'facilities'
ORDER BY ordinal_position;

-- 4. Test insert to make sure it works
SELECT '=== TESTING FACILITY INSERT ===' as info;
INSERT INTO facilities (
    name, 
    description, 
    facility_type, 
    address, 
    city, 
    state, 
    zip_code, 
    country, 
    contact_phone, 
    contact_email, 
    website_url, 
    owner_id, 
    status, 
    is_verified, 
    featured
) VALUES (
    'Test Facility',
    'A test facility for development',
    'basketball_court',
    '123 Test Street',
    'Test City',
    'Test State',
    '12345',
    'USA',
    '555-1234',
    'test@example.com',
    'https://example.com',
    (SELECT id FROM users WHERE email = '9610hemant@gmail.com' LIMIT 1),
    'active',
    false,
    false
) ON CONFLICT (name) DO NOTHING;

-- 5. Show the test facility
SELECT '=== TEST FACILITY CREATED ===' as info;
SELECT name, facility_type, city, state, status FROM facilities WHERE name = 'Test Facility';
