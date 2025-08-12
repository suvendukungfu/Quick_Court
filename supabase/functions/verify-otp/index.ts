import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
  purpose: 'registration' | 'login' | 'phone_verification' | 'password_reset';
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

    const { phoneNumber, otpCode, purpose }: VerifyOTPRequest = await req.json()

    // Validate input
    if (!phoneNumber || !otpCode || !purpose) {
      return new Response(
        JSON.stringify({ error: 'Phone number, OTP code, and purpose are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find valid OTP
    const { data: otpRecord, error: findError } = await supabaseClient
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .eq('purpose', purpose)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .lt('attempts', 3)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findError || !otpRecord) {
      // Increment attempts for any matching OTP
      await supabaseClient
        .from('otp_verifications')
        .update({ attempts: supabaseClient.sql`attempts + 1` })
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otpCode)
        .eq('purpose', purpose)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired OTP. Please request a new one.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark OTP as verified
    const { error: verifyError } = await supabaseClient
      .from('otp_verifications')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)

    if (verifyError) {
      console.error('OTP verification error:', verifyError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user's phone verification status if this was for phone verification
    if (purpose === 'phone_verification' && otpRecord.user_id) {
      await supabaseClient
        .from('users')
        .update({ phone_verified: true })
        .eq('id', otpRecord.user_id)
    }

    // Get user data if this was a login attempt
    let userData = null
    if (purpose === 'login') {
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .single()

      if (!userError && user) {
        userData = user
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP verified successfully',
        userId: otpRecord.user_id,
        phoneNumber,
        purpose,
        userData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Verify OTP error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})