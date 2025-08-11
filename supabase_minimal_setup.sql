-- Minimal setup for facility_properties table
-- Run this in your Supabase SQL editor first

-- Drop the table if it exists (for clean setup)
DROP TABLE IF EXISTS facility_properties;

-- Create the basic table structure
CREATE TABLE facility_properties (
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
    price_per_hour DECIMAL(10,2) DEFAULT 0,
    operating_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}',
    contact_phone TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic index
CREATE INDEX idx_facility_properties_owner ON facility_properties(owner_id);

-- Enable RLS
ALTER TABLE facility_properties ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view active properties" ON facility_properties
    FOR SELECT USING (current_status = 'active' AND is_sold = false);

CREATE POLICY "Owners can manage own properties" ON facility_properties
    FOR ALL USING (auth.uid() = owner_id);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facility_properties_updated_at 
    BEFORE UPDATE ON facility_properties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
