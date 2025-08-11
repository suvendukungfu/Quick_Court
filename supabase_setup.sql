-- Create the facility_properties table in Supabase
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS facility_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    property_type TEXT NOT NULL,
    address TEXT NOT NULL,
    current_status TEXT DEFAULT 'active' CHECK (current_status IN ('active', 'inactive', 'maintenance')),
    is_sold BOOLEAN DEFAULT FALSE,
    current_booking_start TIMESTAMPTZ,
    current_booking_end TIMESTAMPTZ,
    next_available_time TIMESTAMPTZ,
    total_booked_hours DECIMAL(5,2) DEFAULT 0,
    monthly_booked_hours DECIMAL(5,2) DEFAULT 0,
    description TEXT,
    sports TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    price_per_hour DECIMAL(10,2) DEFAULT 0,
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}',
    contact_phone TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facility_properties_owner ON facility_properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_facility_properties_status ON facility_properties(current_status);
CREATE INDEX IF NOT EXISTS idx_facility_properties_type ON facility_properties(property_type);
CREATE INDEX IF NOT EXISTS idx_facility_properties_created ON facility_properties(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE facility_properties ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Policy 1: Users can view all active, non-sold properties
CREATE POLICY "Users can view active properties" ON facility_properties
    FOR SELECT USING (
        current_status = 'active' 
        AND is_sold = false
    );

-- Policy 2: Facility owners can view their own properties
CREATE POLICY "Owners can view own properties" ON facility_properties
    FOR SELECT USING (
        auth.uid() = owner_id
    );

-- Policy 3: Facility owners can insert their own properties
CREATE POLICY "Owners can insert own properties" ON facility_properties
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id
    );

-- Policy 4: Facility owners can update their own properties
CREATE POLICY "Owners can update own properties" ON facility_properties
    FOR UPDATE USING (
        auth.uid() = owner_id
    );

-- Policy 5: Facility owners can delete their own properties
CREATE POLICY "Owners can delete own properties" ON facility_properties
    FOR DELETE USING (
        auth.uid() = owner_id
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_facility_properties_updated_at 
    BEFORE UPDATE ON facility_properties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO facility_properties (
    owner_id,
    property_name,
    property_type,
    address,
    description,
    sports,
    amenities,
    price_per_hour,
    contact_email
) VALUES 
(
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    'Sample Basketball Court',
    'basketball_court',
    '123 Sample St, Test City',
    'A sample basketball court for testing purposes',
    ARRAY['Basketball'],
    ARRAY['Parking', 'Equipment'],
    25.00,
    'test@example.com'
) ON CONFLICT DO NOTHING;
