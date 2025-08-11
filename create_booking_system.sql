-- CREATE BOOKING SYSTEM TABLES
-- Run this in Supabase SQL Editor

-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_slot_id UUID REFERENCES facility_schedules(id) ON DELETE SET NULL,
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

-- 2. Create booking_notifications table for real-time updates
CREATE TABLE IF NOT EXISTS booking_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_facility_id ON bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_facility_date ON bookings(facility_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_user_id ON booking_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_is_read ON booking_notifications(is_read);

-- 4. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger for bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Create RLS policies for bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy for customers to view their own bookings
CREATE POLICY "Customers can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Policy for customers to create bookings
CREATE POLICY "Customers can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

-- Policy for customers to update their own bookings (cancel, add notes)
CREATE POLICY "Customers can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid()::text = customer_id::text);

-- Policy for facility owners to view bookings for their facilities
CREATE POLICY "Facility owners can view bookings for their facilities" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facilities 
            WHERE facilities.id = bookings.facility_id 
            AND facilities.owner_id = auth.uid()::text
        )
    );

-- Policy for facility owners to update bookings for their facilities (approve/deny)
CREATE POLICY "Facility owners can update bookings for their facilities" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM facilities 
            WHERE facilities.id = bookings.facility_id 
            AND facilities.owner_id = auth.uid()::text
        )
    );

-- Policy for admins to view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Create RLS policies for booking_notifications table
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON booking_notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy for users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON booking_notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy for system to create notifications
CREATE POLICY "System can create notifications" ON booking_notifications
    FOR INSERT WITH CHECK (true);

-- 8. Create function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflicts(
    p_facility_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bookings
        WHERE facility_id = p_facility_id
        AND booking_date = p_booking_date
        AND status IN ('pending', 'approved')
        AND (
            (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id) AND
            (
                (start_time < p_end_time AND end_time > p_start_time) OR
                (p_start_time < end_time AND p_end_time > start_time)
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to calculate booking duration
CREATE OR REPLACE FUNCTION calculate_booking_duration(
    p_start_time TIME,
    p_end_time TIME
)
RETURNS DECIMAL(4,2) AS $$
BEGIN
    RETURN EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600.0;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to create booking notification
CREATE OR REPLACE FUNCTION create_booking_notification(
    p_booking_id UUID,
    p_user_id UUID,
    p_notification_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO booking_notifications (booking_id, user_id, notification_type, title, message)
    VALUES (p_booking_id, p_user_id, p_notification_type, p_title, p_message);
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to notify facility owner when booking is created
CREATE OR REPLACE FUNCTION notify_owner_on_booking()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    -- Get facility owner ID
    SELECT facilities.owner_id INTO owner_id
    FROM facilities
    WHERE facilities.id = NEW.facility_id;
    
    -- Create notification for facility owner
    PERFORM create_booking_notification(
        NEW.id,
        owner_id,
        'new_booking',
        'New Booking Request',
        'You have a new booking request for ' || NEW.booking_date || ' from ' || NEW.start_time || ' to ' || NEW.end_time
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_owner_on_booking ON bookings;
CREATE TRIGGER trigger_notify_owner_on_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_owner_on_booking();

-- 12. Create trigger to notify customer when booking status changes
CREATE OR REPLACE FUNCTION notify_customer_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if status changed
    IF OLD.status != NEW.status THEN
        -- Create notification for customer
        PERFORM create_booking_notification(
            NEW.id,
            NEW.customer_id,
            'status_update',
            'Booking ' || NEW.status,
            'Your booking for ' || NEW.booking_date || ' has been ' || NEW.status
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_customer_on_status_change ON bookings;
CREATE TRIGGER trigger_notify_customer_on_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_customer_on_status_change();

-- 13. Insert sample data for testing
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
) VALUES 
(
    (SELECT id FROM facilities LIMIT 1),
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    '12:00:00',
    2.0,
    100.00,
    'pending',
    'pending',
    'Please ensure the court is clean'
),
(
    (SELECT id FROM facilities LIMIT 1),
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    CURRENT_DATE + INTERVAL '3 days',
    '14:00:00',
    '16:00:00',
    2.0,
    120.00,
    'approved',
    'paid',
    'Need extra balls'
)
ON CONFLICT DO NOTHING;

-- 14. Show the created tables
SELECT '=== BOOKING SYSTEM TABLES CREATED ===' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('bookings', 'booking_notifications')
ORDER BY table_name, ordinal_position;

-- 15. Show sample bookings
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
