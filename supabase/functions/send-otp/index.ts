import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OTPRequest {
  phoneNumber: string;
  purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset';
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { phoneNumber, purpose, userId }: OTPRequest = await req.json()

    // Validate input
    if (!phoneNumber || !purpose) {
      return new Response(
        JSON.stringify({ error: 'Phone number and purpose are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limiting (max 3 OTPs per phone per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentOTPs, error: rateLimitError } = await supabaseClient
      .from('otp_verifications')
      .select('id')
      .eq('phone_number', phoneNumber)
      .gte('created_at', oneHourAgo)

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limits' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (recentOTPs && recentOTPs.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many OTP requests. Please wait an hour.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store OTP in database
    const { data: otpData, error: otpError } = await supabaseClient
      .from('otp_verifications')
      .insert([{
        user_id: userId || null,
        phone_number: phoneNumber,
        otp_code: otpCode,
        purpose,
        expires_at: expiresAt,
        is_verified: false,
        attempts: 0,
        max_attempts: 3
      }])
      .select()
      .single()

    if (otpError) {
      console.error('OTP storage error:', otpError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send OTP via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: phoneNumber,
            Body: `Your QuickCourt verification code is: ${otpCode}. This code expires in 10 minutes.`
          })
        })

        if (!twilioResponse.ok) {
          const twilioError = await twilioResponse.text()
          console.error('Twilio error:', twilioError)
          
          // Delete the OTP record if SMS failed
          await supabaseClient
            .from('otp_verifications')
            .delete()
            .eq('id', otpData.id)

          return new Response(
            JSON.stringify({ error: 'Failed to send SMS' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log(`OTP sent successfully to ${phoneNumber}`)
      } catch (twilioError) {
        console.error('Twilio request error:', twilioError)
        
        // Delete the OTP record if SMS failed
        await supabaseClient
          .from('otp_verifications')
          .delete()
          .eq('id', otpData.id)

        return new Response(
          JSON.stringify({ error: 'Failed to send SMS' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      // Development mode - log OTP instead of sending
      console.log(`🔐 OTP for ${phoneNumber}: ${otpCode} (expires in 10 minutes)`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        otpId: otpData.id,
        expiresAt 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Send OTP error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})