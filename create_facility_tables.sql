-- CREATE ALL FACILITY-RELATED TABLES
-- Run this in Supabase SQL Editor

-- 1. Create facility_amenities table
CREATE TABLE IF NOT EXISTS facility_amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    amenity_name TEXT NOT NULL,
    amenity_type TEXT CHECK (amenity_type IN ('equipment', 'service', 'infrastructure', 'safety', 'comfort')),
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create facility_images table
CREATE TABLE IF NOT EXISTS facility_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT CHECK (image_type IN ('main', 'gallery', 'thumbnail')),
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create facility_schedules table
CREATE TABLE IF NOT EXISTS facility_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    special_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create facility_pricing table
CREATE TABLE IF NOT EXISTS facility_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    pricing_type TEXT CHECK (pricing_type IN ('hourly', 'daily', 'weekly', 'monthly', 'seasonal')),
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    peak_hour_multiplier DECIMAL(3,2) DEFAULT 1.0,
    off_peak_discount DECIMAL(3,2) DEFAULT 1.0,
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.0,
    holiday_multiplier DECIMAL(3,2) DEFAULT 1.0,
    minimum_booking_hours INTEGER DEFAULT 1,
    maximum_booking_hours INTEGER DEFAULT 24,
    cancellation_policy TEXT,
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facility_amenities_facility_id ON facility_amenities(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_images_facility_id ON facility_images(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_schedules_facility_id ON facility_schedules(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_pricing_facility_id ON facility_pricing(facility_id);

-- 6. Insert sample data for testing
-- Sample amenities for existing facilities
INSERT INTO facility_amenities (facility_id, amenity_name, amenity_type, description) 
SELECT 
    f.id,
    'Parking' as amenity_name,
    'infrastructure' as amenity_type,
    'Free parking available'
FROM facilities f
WHERE NOT EXISTS (SELECT 1 FROM facility_amenities WHERE facility_id = f.id)
LIMIT 1;

-- Sample pricing for existing facilities
INSERT INTO facility_pricing (facility_id, pricing_type, base_price, currency)
SELECT 
    f.id,
    'hourly' as pricing_type,
    25.00 as base_price,
    'USD' as currency
FROM facilities f
WHERE NOT EXISTS (SELECT 1 FROM facility_pricing WHERE facility_id = f.id)
LIMIT 1;

-- Sample schedule for existing facilities
INSERT INTO facility_schedules (facility_id, day_of_week, open_time, close_time, is_closed)
SELECT 
    f.id,
    1 as day_of_week, -- Monday
    '06:00:00' as open_time,
    '22:00:00' as close_time,
    false as is_closed
FROM facilities f
WHERE NOT EXISTS (SELECT 1 FROM facility_schedules WHERE facility_id = f.id)
LIMIT 1;

-- 7. Grant permissions
GRANT ALL ON facility_amenities TO authenticated;
GRANT ALL ON facility_images TO authenticated;
GRANT ALL ON facility_schedules TO authenticated;
GRANT ALL ON facility_pricing TO authenticated;

-- 8. Enable RLS on new tables
ALTER TABLE facility_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_pricing ENABLE ROW LEVEL SECURITY;

-- 9. Create simple RLS policies
CREATE POLICY "Allow all operations on facility_amenities" ON facility_amenities FOR ALL USING (true);
CREATE POLICY "Allow all operations on facility_images" ON facility_images FOR ALL USING (true);
CREATE POLICY "Allow all operations on facility_schedules" ON facility_schedules FOR ALL USING (true);
CREATE POLICY "Allow all operations on facility_pricing" ON facility_pricing FOR ALL USING (true);

-- 10. Verify tables were created
SELECT '=== VERIFICATION ===' as info;
SELECT 'facility_amenities count:' as table_name, COUNT(*) as count FROM facility_amenities;
SELECT 'facility_images count:' as table_name, COUNT(*) as count FROM facility_images;
SELECT 'facility_schedules count:' as table_name, COUNT(*) as count FROM facility_schedules;
SELECT 'facility_pricing count:' as table_name, COUNT(*) as count FROM facility_pricing;
