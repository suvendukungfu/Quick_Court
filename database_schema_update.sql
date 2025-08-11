-- Database Schema Update for QuickCourt
-- Run this in your Supabase SQL editor

-- 1. Drop existing tables and views if they exist (for clean setup)
DROP VIEW IF EXISTS facility_availability CASCADE;
DROP TABLE IF EXISTS facility_availability CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create enhanced users table with unique IDs and role management
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'facility_owner', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'inactive')),
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    business_name TEXT, -- For facility owners
    business_address TEXT, -- For facility owners
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create facility_availability table with proper user mapping
CREATE TABLE facility_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    property_type TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    current_status TEXT DEFAULT 'active' CHECK (current_status IN ('active', 'inactive', 'maintenance')),
    is_sold BOOLEAN DEFAULT FALSE,
    current_booking_start TIMESTAMPTZ,
    current_booking_end TIMESTAMPTZ,
    next_available_time TIMESTAMPTZ,
    total_booked_hours DECIMAL(5,2) DEFAULT 0,
    monthly_booked_hours DECIMAL(5,2) DEFAULT 0,
    price_per_hour DECIMAL(10,2) DEFAULT 25.00,
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}',
    contact_phone TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_facility_availability_user_id ON facility_availability(user_id);
CREATE INDEX idx_facility_availability_status ON facility_availability(current_status);
CREATE INDEX idx_facility_availability_type ON facility_availability(property_type);
CREATE INDEX idx_facility_availability_created ON facility_availability(created_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_availability ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for users table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- 7. Create RLS policies for facility_availability table
-- Facility owners can view their own properties
CREATE POLICY "Owners can view own properties" ON facility_availability
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- Facility owners can insert their own properties
CREATE POLICY "Owners can insert own properties" ON facility_availability
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Facility owners can update their own properties
CREATE POLICY "Owners can update own properties" ON facility_availability
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Facility owners can delete their own properties
CREATE POLICY "Owners can delete own properties" ON facility_availability
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Customers can view active, non-sold properties
CREATE POLICY "Customers can view active properties" ON facility_availability
    FOR SELECT USING (
        current_status = 'active' 
        AND is_sold = false
    );

-- Admins can view all properties
CREATE POLICY "Admins can view all properties" ON facility_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- 8. Create trigger function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_availability_updated_at 
    BEFORE UPDATE ON facility_availability 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create a view for facility owner dashboard statistics
CREATE OR REPLACE VIEW facility_owner_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.business_name,
    COUNT(fa.id) as total_properties,
    COUNT(CASE WHEN fa.current_status = 'active' THEN 1 END) as active_properties,
    COUNT(CASE WHEN fa.current_status = 'maintenance' THEN 1 END) as maintenance_properties,
    COUNT(CASE WHEN fa.is_sold = true THEN 1 END) as sold_properties,
    SUM(fa.total_booked_hours) as total_booked_hours,
    SUM(fa.monthly_booked_hours) as monthly_booked_hours,
    SUM(fa.monthly_booked_hours * fa.price_per_hour) as estimated_monthly_revenue
FROM users u
LEFT JOIN facility_availability fa ON u.id = fa.user_id
WHERE u.role = 'facility_owner'
GROUP BY u.id, u.full_name, u.business_name;

-- 11. Insert sample admin user (optional - replace with your actual admin credentials)
INSERT INTO users (email, full_name, role, status) 
VALUES ('admin@quickcourt.com', 'System Administrator', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 13. Verify the setup
SELECT 'Schema setup completed successfully!' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'facility_availability') 
ORDER BY table_name, ordinal_position;
