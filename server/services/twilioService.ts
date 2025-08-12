import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not configured. OTP functionality will be disabled.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export class TwilioService {
  static async sendOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
    if (!client || !twilioPhoneNumber) {
      console.error('Twilio not configured');
      // In development, log the OTP instead of sending
      console.log(`🔐 OTP for ${phoneNumber}: ${otpCode}`);
      return true; // Return true for development
    }

    try {
      const message = await client.messages.create({
        body: `Your QuickCourt verification code is: ${otpCode}. This code expires in 10 minutes.`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log(`OTP sent successfully to ${phoneNumber}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  }

  static async sendWelcomeSMS(phoneNumber: string, userName: string): Promise<boolean> {
    if (!client || !twilioPhoneNumber) {
      console.log(`📱 Welcome SMS for ${userName} at ${phoneNumber}: Welcome to QuickCourt!`);
      return true;
    }

    try {
      const message = await client.messages.create({
        body: `Welcome to QuickCourt, ${userName}! Your account has been created successfully. Start booking amazing sports facilities today!`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });

      console.log(`Welcome SMS sent to ${phoneNumber}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome SMS:', error);
      return false;
    }
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add + if not present
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}