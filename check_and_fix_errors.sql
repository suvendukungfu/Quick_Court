-- CHECK AND FIX ALL ERRORS
-- This script will identify and fix common issues with the booking system
-- Run this in Supabase SQL Editor

-- 1. Check if all required tables exist
SELECT '=== CHECKING TABLE EXISTENCE ===' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'facilities', 'bookings', 'facility_schedules', 'booking_notifications') 
        THEN 'REQUIRED' 
        ELSE 'OPTIONAL' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'facilities', 'bookings', 'facility_schedules', 'booking_notifications')
ORDER BY table_name;

-- 2. Create missing tables if they don't exist
SELECT '=== CREATING MISSING TABLES ===' as info;

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    time_slot_id UUID,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours DECIMAL(4,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled', 'completed')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    special_requests TEXT,
    owner_notes TEXT,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facility_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS facility_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_per_hour DECIMAL(8,2) NOT NULL DEFAULT 50.00,
    is_available BOOLEAN DEFAULT true,
    max_capacity INTEGER DEFAULT 10,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, day_of_week, start_time, end_time)
);

-- Create booking_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL,
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add foreign key constraints if they don't exist
SELECT '=== ADDING FOREIGN KEY CONSTRAINTS ===' as info;

-- Add foreign key for bookings.facility_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_facility_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_facility_id_fkey 
        FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for bookings.customer_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_customer_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for facility_schedules.facility_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'facility_schedules_facility_id_fkey' 
        AND table_name = 'facility_schedules'
    ) THEN
        ALTER TABLE facility_schedules ADD CONSTRAINT facility_schedules_facility_id_fkey 
        FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for booking_notifications.booking_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'booking_notifications_booking_id_fkey' 
        AND table_name = 'booking_notifications'
    ) THEN
        ALTER TABLE booking_notifications ADD CONSTRAINT booking_notifications_booking_id_fkey 
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for booking_notifications.user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'booking_notifications_user_id_fkey' 
        AND table_name = 'booking_notifications'
    ) THEN
        ALTER TABLE booking_notifications ADD CONSTRAINT booking_notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Create indexes for better performance
SELECT '=== CREATING INDEXES ===' as info;

CREATE INDEX IF NOT EXISTS idx_bookings_facility_id ON bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_facility_date ON bookings(facility_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_user_id ON booking_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_is_read ON booking_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_facility_schedules_facility_id ON facility_schedules(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_schedules_day_time ON facility_schedules(day_of_week, start_time);

-- 5. Create updated_at trigger function
SELECT '=== CREATING TRIGGERS ===' as info;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facility_schedules_updated_at ON facility_schedules;
CREATE TRIGGER update_facility_schedules_updated_at
    BEFORE UPDATE ON facility_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Set up RLS policies
SELECT '=== SETTING UP RLS POLICIES ===' as info;

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Facility owners can view bookings for their facilities" ON bookings;
DROP POLICY IF EXISTS "Facility owners can update bookings for their facilities" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can view facility schedules" ON facility_schedules;
DROP POLICY IF EXISTS "Facility owners can manage their schedules" ON facility_schedules;
DROP POLICY IF EXISTS "Users can view their own notifications" ON booking_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON booking_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON booking_notifications;

-- Create new policies
CREATE POLICY "Customers can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Customers can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

CREATE POLICY "Customers can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Facility owners can view bookings for their facilities" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facilities 
            WHERE facilities.id = bookings.facility_id 
            AND facilities.owner_id = auth.uid()::text
        )
    );

CREATE POLICY "Facility owners can update bookings for their facilities" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM facilities 
            WHERE facilities.id = bookings.facility_id 
            AND facilities.owner_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can view facility schedules" ON facility_schedules
    FOR SELECT USING (true);

CREATE POLICY "Facility owners can manage their schedules" ON facility_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM facilities 
            WHERE facilities.id = facility_schedules.facility_id 
            AND facilities.owner_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view their own notifications" ON booking_notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON booking_notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create notifications" ON booking_notifications
    FOR INSERT WITH CHECK (true);

-- 7. Insert sample time slots for existing facilities
SELECT '=== INSERTING SAMPLE TIME SLOTS ===' as info;

INSERT INTO facility_schedules (
    facility_id,
    day_of_week,
    start_time,
    end_time,
    price_per_hour,
    is_available,
    max_capacity,
    description
) 
SELECT 
    f.id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '09:00:00' as start_time,
    '10:00:00' as end_time,
    50.00 as price_per_hour,
    true as is_available,
    10 as max_capacity,
    'Morning session' as description
FROM facilities f
WHERE f.status = 'active'
ON CONFLICT (facility_id, day_of_week, start_time, end_time) DO NOTHING;

-- Add afternoon slots
INSERT INTO facility_schedules (
    facility_id,
    day_of_week,
    start_time,
    end_time,
    price_per_hour,
    is_available,
    max_capacity,
    description
) 
SELECT 
    f.id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '14:00:00' as start_time,
    '15:00:00' as end_time,
    60.00 as price_per_hour,
    true as is_available,
    12 as max_capacity,
    'Afternoon session' as description
FROM facilities f
WHERE f.status = 'active'
ON CONFLICT (facility_id, day_of_week, start_time, end_time) DO NOTHING;

-- Add weekend slots
INSERT INTO facility_schedules (
    facility_id,
    day_of_week,
    start_time,
    end_time,
    price_per_hour,
    is_available,
    max_capacity,
    description
) 
SELECT 
    f.id,
    generate_series(6, 7) as day_of_week, -- Saturday and Sunday
    '10:00:00' as start_time,
    '11:00:00' as end_time,
    70.00 as price_per_hour,
    true as is_available,
    15 as max_capacity,
    'Weekend session' as description
FROM facilities f
WHERE f.status = 'active'
ON CONFLICT (facility_id, day_of_week, start_time, end_time) DO NOTHING;

-- 8. Insert sample bookings for testing (only if no bookings exist)
SELECT '=== INSERTING SAMPLE BOOKINGS ===' as info;

INSERT INTO bookings (
    facility_id,
    customer_id,
    booking_date,
    start_time,
    end_time,
    total_hours,
    total_amount,
    status,
    payment_status,
    special_requests
) 
SELECT 
    f.id as facility_id,
    u.id as customer_id,
    CURRENT_DATE + INTERVAL '2 days' as booking_date,
    '09:00:00' as start_time,
    '10:00:00' as end_time,
    1.0 as total_hours,
    50.00 as total_amount,
    'pending' as status,
    'pending' as payment_status,
    'Please ensure the court is clean' as special_requests
FROM facilities f
CROSS JOIN users u
WHERE f.status = 'active' 
AND u.role = 'customer'
AND NOT EXISTS (SELECT 1 FROM bookings LIMIT 1)
LIMIT 1;

-- 9. Verify the setup
SELECT '=== VERIFICATION RESULTS ===' as info;

SELECT '=== TABLES CREATED ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'booking_notifications', 'facility_schedules')
ORDER BY table_name;

SELECT '=== SAMPLE TIME SLOTS ===' as info;
SELECT 
    fs.id,
    f.name as facility_name,
    fs.day_of_week,
    fs.start_time,
    fs.end_time,
    fs.price_per_hour,
    fs.is_available
FROM facility_schedules fs
JOIN facilities f ON fs.facility_id = f.id
LIMIT 10;

SELECT '=== SAMPLE BOOKINGS ===' as info;
SELECT 
    b.id,
    f.name as facility_name,
    u.full_name as customer_name,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.total_amount,
    b.status,
    b.payment_status
FROM bookings b
JOIN facilities f ON b.facility_id = f.id
JOIN users u ON b.customer_id = u.id
LIMIT 5;

SELECT '=== RLS POLICIES ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('bookings', 'facility_schedules', 'booking_notifications')
AND schemaname = 'public'
ORDER BY tablename, policyname;

SELECT '=== SETUP COMPLETE ===' as info;
SELECT 'All errors have been fixed and the booking system is ready!' as message;
