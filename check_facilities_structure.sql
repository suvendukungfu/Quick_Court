-- CHECK FACILITIES TABLE STRUCTURE
-- Run this in Supabase SQL Editor

-- 1. Check current table structure
SELECT '=== CURRENT FACILITIES TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facilities'
ORDER BY ordinal_position;

-- 2. Check if we need to add missing columns
SELECT '=== CHECKING FOR MISSING COLUMNS ===' as info;

-- Check if contact_phone exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'contact_phone') 
        THEN 'contact_phone column exists' 
        ELSE 'contact_phone column MISSING' 
    END as status;

-- Check if contact_email exists  
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'contact_email') 
        THEN 'contact_email column exists' 
        ELSE 'contact_email column MISSING' 
    END as status;

-- Check if website_url exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facilities' AND column_name = 'website_url') 
        THEN 'website_url column exists' 
        ELSE 'website_url column MISSING' 
    END as status;

-- 3. Add missing columns if they don't exist
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
END $$;

-- 4. Verify final structure
SELECT '=== FINAL FACILITIES TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'facilities'
ORDER BY ordinal_position;
