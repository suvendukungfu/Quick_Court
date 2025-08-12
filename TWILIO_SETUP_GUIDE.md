# Twilio OTP Authentication Setup Guide

## 🚀 Overview

This guide will help you set up OTP (One-Time Password) authentication using Twilio SMS and Supabase for your QuickCourt application.

## 📋 Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **Supabase Project**: Your existing QuickCourt Supabase project
3. **Phone Number**: A Twilio phone number for sending SMS

## 🔧 Step 1: Twilio Setup

### 1.1 Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com) and sign up
2. Complete phone verification
3. Navigate to the Twilio Console

### 1.2 Get Twilio Credentials
1. **Account SID**: Found on your Twilio Console Dashboard
2. **Auth Token**: Found on your Twilio Console Dashboard (click "Show" to reveal)
3. **Phone Number**: Purchase a phone number from Twilio Console > Phone Numbers > Manage > Buy a number

### 1.3 Configure Environment Variables
Update your `.env` file with your Twilio credentials:

```env
# Twilio Configuration
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+1234567890

# Server-side Twilio (for Edge Functions)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🗄️ Step 2: Database Setup

### 2.1 Run the Migration
Execute the `setup_otp_authentication.sql` file in your Supabase SQL Editor. This will:

- Add phone number fields to the users table
- Create OTP verification table
- Create user sessions table
- Set up proper indexes and RLS policies

### 2.2 Verify Database Changes
After running the migration, verify the changes:

```sql
-- Check if new columns were added to users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'phone_verified', 'preferred_auth_method');

-- Check if new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('otp_verifications', 'user_sessions');
```

## 🔐 Step 3: Supabase Edge Functions

### 3.1 Deploy Edge Functions
The OTP system uses two Supabase Edge Functions:

1. **send-otp**: Generates and sends OTP codes via Twilio
2. **verify-otp**: Verifies OTP codes and manages user sessions

These functions are automatically deployed when you save them in the `supabase/functions/` directory.

### 3.2 Set Environment Variables in Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. Add the following environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## 📱 Step 4: Frontend Integration

### 4.1 New Authentication Flow
The system now supports multiple authentication methods:

1. **Email + Password** (existing)
2. **Phone + OTP** (new)
3. **Phone + Password** (hybrid)

### 4.2 New Pages and Components
- `OTPLoginPage`: Phone-based login with OTP
- `PhoneRegisterPage`: Registration with phone verification
- `PhoneInput`: Reusable phone number input component
- `OTPInput`: 6-digit OTP input component
- `AuthMethodSelector`: Choose between OTP and password

### 4.3 Updated Routes
New routes have been added to your application:
- `/login/otp` - OTP-based login
- `/register/phone` - Phone-based registration

## 🧪 Step 5: Testing

### 5.1 Test Registration Flow
1. Go to `/register/phone`
2. Fill in user details including phone number
3. Submit form to receive OTP
4. Enter OTP to complete registration

### 5.2 Test Login Flow
1. Go to `/login/otp`
2. Enter registered phone number
3. Choose authentication method (if user has 'both' preference)
4. Complete OTP or password verification

### 5.3 Development Testing
In development mode (when Twilio credentials are not set):
- OTP codes are logged to the console instead of being sent via SMS
- Check your browser console for the OTP code
- This allows testing without incurring SMS costs

## 🔒 Security Features

### 5.1 Rate Limiting
- Maximum 3 OTP requests per phone number per hour
- Prevents spam and abuse

### 5.2 OTP Expiration
- OTP codes expire after 10 minutes
- Automatic cleanup of expired codes

### 5.3 Attempt Limiting
- Maximum 3 verification attempts per OTP
- Prevents brute force attacks

### 5.4 Row Level Security
- All OTP and session data is protected with RLS policies
- Users can only access their own OTP verifications and sessions

## 🎯 User Experience Features

### 5.1 Flexible Authentication
- Users can choose their preferred login method during registration
- Support for OTP-only, password-only, or both methods

### 5.2 Smart Method Selection
- System remembers user's preferred authentication method
- Automatic method selection based on user preference

### 5.3 Fallback Options
- Users can always switch between OTP and password login
- Email login remains available as backup

## 🚨 Important Notes

### 5.1 Twilio Costs
- Each SMS costs money (typically $0.0075 per message)
- Monitor usage to avoid unexpected charges
- Consider implementing daily/monthly limits

### 5.2 Phone Number Validation
- System validates international phone number format
- Requires country code (e.g., +1 for US)
- Supports all international formats

### 5.3 Production Considerations
- Set up proper error monitoring
- Implement logging for OTP attempts
- Consider adding CAPTCHA for additional security
- Set up alerts for high OTP usage

## 🔧 Troubleshooting

### Common Issues:

1. **OTP not received**
   - Check Twilio credentials
   - Verify phone number format
   - Check Twilio account balance

2. **Database errors**
   - Ensure migration was run successfully
   - Check RLS policies are enabled
   - Verify foreign key constraints

3. **Edge function errors**
   - Check Supabase function logs
   - Verify environment variables are set
   - Ensure proper CORS headers

### Debug Steps:

1. **Check browser console** for OTP codes in development
2. **Verify Twilio credentials** in Supabase dashboard
3. **Test database queries** in Supabase SQL editor
4. **Check Edge function logs** in Supabase dashboard

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test the database migration in Supabase SQL editor
4. Check Twilio account status and balance

---

**Happy coding! 🎉**

Your QuickCourt application now supports modern OTP authentication with flexible login options!

## 🎯 Next Steps

1. **Test the complete flow** with a real phone number
2. **Customize SMS messages** in the Edge functions
3. **Add phone number to user profiles** for easy management
4. **Implement phone number change** with OTP verification
5. **Add two-factor authentication** for enhanced security