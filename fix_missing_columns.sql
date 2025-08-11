-- FIX MISSING COLUMNS IN FACILITY TABLES
-- Run this in Supabase SQL Editor

-- 1. Add missing amenity_type column to facility_amenities
ALTER TABLE facility_amenities 
ADD COLUMN IF NOT EXISTS amenity_type TEXT CHECK (amenity_type IN ('equipment', 'service', 'infrastructure', 'safety', 'comfort'));

-- 2. Verify the column was added
SELECT '=== FACILITY_AMENITIES COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'facility_amenities'
ORDER BY ordinal_position;

-- 3. Check if all tables have the expected structure
SELECT '=== ALL FACILITY TABLES STATUS ===' as info;

SELECT 'facilities' as table_name, COUNT(*) as count FROM facilities
UNION ALL
SELECT 'facility_amenities' as table_name, COUNT(*) as count FROM facility_amenities
UNION ALL
SELECT 'facility_images' as table_name, COUNT(*) as count FROM facility_images
UNION ALL
SELECT 'facility_schedules' as table_name, COUNT(*) as count FROM facility_schedules
UNION ALL
SELECT 'facility_pricing' as table_name, COUNT(*) as count FROM facility_pricing;

-- 4. Test a basic query to see if the API call will work
SELECT '=== TEST API QUERY ===' as info;
SELECT 
    f.id,
    f.name,
    f.facility_type,
    f.status,
    f.created_at
FROM facilities f
LIMIT 3;
