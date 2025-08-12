import { supabase } from './supabase';
import { TwilioService } from '../../../server/services/twilioService';

export interface OTPVerification {
  id: string;
  user_id?: string;
  phone_number: string;
  otp_code: string;
  purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset';
  is_verified: boolean;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  verified_at?: string;
  created_at: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class OTPService {
  // Generate and send OTP
  static async sendOTP(
    phoneNumber: string, 
    purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset' = 'login',
    userId?: string
  ): Promise<OTPResponse> {
    try {
      // Validate phone number format
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use international format (+1234567890)'
        };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Check rate limiting (max 3 OTPs per phone per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentOTPs, error: rateLimitError } = await supabase
        .from('otp_verifications')
        .select('id')
        .eq('phone_number', formattedPhone)
        .gte('created_at', oneHourAgo);

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        return {
          success: false,
          message: 'Failed to check rate limits. Please try again.'
        };
      }

      if (recentOTPs && recentOTPs.length >= 3) {
        return {
          success: false,
          message: 'Too many OTP requests. Please wait an hour before requesting again.'
        };
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration to 10 minutes from now
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Store OTP in database
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .insert([{
          user_id: userId || null,
          phone_number: formattedPhone,
          otp_code: otpCode,
          purpose,
          expires_at: expiresAt,
          is_verified: false,
          attempts: 0,
          max_attempts: 3
        }])
        .select()
        .single();

      if (otpError) {
        console.error('OTP storage error:', otpError);
        return {
          success: false,
          message: 'Failed to generate OTP. Please try again.'
        };
      }

      // Send OTP via Twilio (this would be done on the server side in production)
      console.log(`🔐 OTP for ${formattedPhone}: ${otpCode} (expires in 10 minutes)`);
      
      // Update user's last_otp_sent timestamp
      if (userId) {
        await supabase
          .from('users')
          .update({ last_otp_sent: new Date().toISOString() })
          .eq('id', userId);
      }

      return {
        success: true,
        message: 'OTP sent successfully to your phone number',
        data: { otpId: otpData.id, expiresAt }
      };

    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Verify OTP
  static async verifyOTP(
    phoneNumber: string,
    otpCode: string,
    purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset' = 'login'
  ): Promise<OTPResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Find valid OTP
      const { data: otpRecord, error: findError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('otp_code', otpCode)
        .eq('purpose', purpose)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .lt('attempts', 3)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (findError || !otpRecord) {
        // Increment attempts for any matching OTP
        await supabase
          .from('otp_verifications')
          .update({ attempts: supabase.sql`attempts + 1` })
          .eq('phone_number', formattedPhone)
          .eq('otp_code', otpCode)
          .eq('purpose', purpose);

        return {
          success: false,
          message: 'Invalid or expired OTP. Please request a new one.'
        };
      }

      // Mark OTP as verified
      const { error: verifyError } = await supabase
        .from('otp_verifications')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', otpRecord.id);

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        return {
          success: false,
          message: 'Failed to verify OTP. Please try again.'
        };
      }

      // Update user's phone verification status if this was for phone verification
      if (purpose === 'phone_verification' && otpRecord.user_id) {
        await supabase
          .from('users')
          .update({ phone_verified: true })
          .eq('id', otpRecord.user_id);
      }

      return {
        success: true,
        message: 'OTP verified successfully',
        data: { 
          userId: otpRecord.user_id,
          phoneNumber: formattedPhone,
          purpose 
        }
      };

    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Check if phone number is already registered
  static async checkPhoneExists(phoneNumber: string): Promise<{ exists: boolean; user?: any }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, phone_verified, preferred_auth_method')
        .eq('phone', formattedPhone)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Phone check error:', error);
        return { exists: false };
      }

      return {
        exists: !!user,
        user: user || undefined
      };
    } catch (error) {
      console.error('Phone exists check error:', error);
      return { exists: false };
    }
  }

  // Validate phone number format
  static validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Format phone number
  static formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    return formatted;
  }

  // Clean up expired OTPs
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      await supabase.rpc('cleanup_expired_otps');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}