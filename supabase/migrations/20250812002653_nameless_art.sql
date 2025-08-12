/*
  # Setup OTP Authentication System

  1. Database Changes
    - Add phone number and OTP fields to users table
    - Add authentication preferences
    - Create OTP verification table
    - Add indexes for performance

  2. Security
    - Enable RLS on new tables
    - Add policies for OTP verification
    - Secure OTP storage with expiration

  3. Features
    - Support for both phone and email authentication
    - OTP verification with expiration
    - User preference for login method
*/

-- Add phone number and authentication preferences to users table
DO $$
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone TEXT;
    END IF;
    
    -- Add phone_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
        ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add preferred_auth_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferred_auth_method') THEN
        ALTER TABLE users ADD COLUMN preferred_auth_method TEXT DEFAULT 'password' CHECK (preferred_auth_method IN ('password', 'otp', 'both'));
    END IF;
    
    -- Add last_otp_sent column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_otp_sent') THEN
        ALTER TABLE users ADD COLUMN last_otp_sent TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('registration', 'login', 'phone_verification', 'password_reset')),
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for OTP-based sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    auth_method TEXT NOT NULL CHECK (auth_method IN ('password', 'otp')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Enable RLS on new tables
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for otp_verifications
CREATE POLICY "Users can view their own OTP verifications" ON otp_verifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create OTP verifications" ON otp_verifications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own OTP verifications" ON otp_verifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all OTP verifications" ON otp_verifications
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < NOW() AND is_verified = FALSE;
    
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate OTP
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_otp(
    p_phone_number TEXT,
    p_otp_code TEXT,
    p_purpose TEXT DEFAULT 'login'
)
RETURNS TABLE(
    success BOOLEAN,
    user_id UUID,
    message TEXT
) AS $$
DECLARE
    v_record RECORD;
    v_user_id UUID;
BEGIN
    -- Find the OTP record
    SELECT * INTO v_record
    FROM otp_verifications
    WHERE phone_number = p_phone_number
    AND otp_code = p_otp_code
    AND purpose = p_purpose
    AND expires_at > NOW()
    AND is_verified = FALSE
    AND attempts < max_attempts
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no valid OTP found
    IF v_record IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid or expired OTP'::TEXT;
        RETURN;
    END IF;
    
    -- Increment attempts
    UPDATE otp_verifications
    SET attempts = attempts + 1
    WHERE id = v_record.id;
    
    -- Mark as verified
    UPDATE otp_verifications
    SET is_verified = TRUE, verified_at = NOW()
    WHERE id = v_record.id;
    
    -- Get or create user
    IF v_record.user_id IS NOT NULL THEN
        v_user_id := v_record.user_id;
    ELSE
        -- For registration, user_id might be null
        SELECT id INTO v_user_id FROM users WHERE phone = p_phone_number LIMIT 1;
    END IF;
    
    RETURN QUERY SELECT TRUE, v_user_id, 'OTP verified successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO users (email, full_name, phone, role, status, phone_verified, preferred_auth_method)
VALUES 
    ('john.doe@example.com', 'John Doe', '+1234567890', 'customer', 'active', TRUE, 'both'),
    ('jane.smith@example.com', 'Jane Smith', '+1987654321', 'facility_owner', 'active', TRUE, 'otp')
ON CONFLICT (email) DO NOTHING;

-- Show verification
SELECT '=== OTP AUTHENTICATION SETUP COMPLETE ===' as info;

SELECT 'Users with phone numbers:' as info;
SELECT id, full_name, email, phone, phone_verified, preferred_auth_method 
FROM users 
WHERE phone IS NOT NULL 
LIMIT 5;

SELECT 'OTP verifications table:' as info;
SELECT COUNT(*) as count FROM otp_verifications;

SELECT 'User sessions table:' as info;
SELECT COUNT(*) as count FROM user_sessions;