import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OTPService } from '../../lib/otpService';
import { Trophy, ArrowLeft, Smartphone, Lock, MessageSquare } from 'lucide-react';
import PhoneInput from '../../components/auth/PhoneInput';
import OTPInput from '../../components/auth/OTPInput';

type LoginStep = 'phone' | 'method_selection' | 'otp' | 'password';

export default function OTPLoginPage() {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userPreference, setUserPreference] = useState<'password' | 'otp' | 'both'>('both');
  const [password, setPassword] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'otp' | 'password'>('otp');

  const { login, isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const dashboardPaths = {
      user: '/home',
      customer: '/home',
      facility_owner: '/owner/dashboard',
      admin: '/admin/dashboard',
    };
    const dashboardPath = dashboardPaths[user.role] || '/home';
    return <Navigate to={dashboardPath} replace />;
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !phoneNumber) return;

    setLoading(true);
    setError('');

    try {
      // Check if phone number exists
      const { exists, user: existingUser } = await OTPService.checkPhoneExists(phoneNumber);
      
      setUserExists(exists);
      
      if (exists && existingUser) {
        setUserPreference(existingUser.preferred_auth_method || 'both');
        
        // If user has preference, go to method selection or directly to that method
        if (existingUser.preferred_auth_method === 'otp') {
          setSelectedMethod('otp');
          setStep('otp');
          // Send OTP immediately
          await sendOTP();
        } else if (existingUser.preferred_auth_method === 'password') {
          setSelectedMethod('password');
          setStep('password');
        } else {
          // User has 'both' preference, show method selection
          setStep('method_selection');
        }
      } else {
        // New user - redirect to registration
        setError('Phone number not found. Please register first or use email login.');
      }
    } catch (err) {
      console.error('Phone check error:', err);
      setError('Failed to verify phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      const response = await OTPService.sendOTP(phoneNumber, 'login');
      if (!response.success) {
        setError(response.message);
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      return false;
    }
  };

  const handleMethodSelection = async (method: 'otp' | 'password') => {
    setSelectedMethod(method);
    setError('');
    
    if (method === 'otp') {
      setLoading(true);
      const success = await sendOTP();
      setLoading(false);
      
      if (success) {
        setStep('otp');
      }
    } else {
      setStep('password');
    }
  };

  const handleOTPComplete = async (otpCode: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await OTPService.verifyOTP(phoneNumber, otpCode, 'login');
      
      if (response.success) {
        // OTP verified, now sign in the user
        // For OTP login, we'll need to create a session or use Supabase auth
        // This is a simplified version - you might need to integrate with Supabase auth
        console.log('OTP verified successfully');
        
        // You would typically create a session here or use Supabase's signInWithOtp
        // For now, we'll redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      // Find user by phone number to get email for login
      const { exists, user: existingUser } = await OTPService.checkPhoneExists(phoneNumber);
      
      if (!exists || !existingUser) {
        setError('User not found. Please check your phone number.');
        setLoading(false);
        return;
      }

      // Use email and password for login
      const success = await login(existingUser.email, password);
      
      if (!success) {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('Password login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    
    const success = await sendOTP();
    setLoading(false);
    
    if (!success) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const goBack = () => {
    setError('');
    if (step === 'method_selection' || step === 'otp' || step === 'password') {
      if (userPreference === 'both') {
        setStep('method_selection');
      } else {
        setStep('phone');
      }
    } else {
      setStep('phone');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to QuickCourt</h2>
          <p className="mt-2 text-gray-600">
            {step === 'phone' && 'Enter your phone number to continue'}
            {step === 'method_selection' && 'Choose your preferred login method'}
            {step === 'otp' && 'Enter the verification code'}
            {step === 'password' && 'Enter your password'}
          </p>
        </div>

        {/* Back button */}
        {step !== 'phone' && (
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        )}

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Phone Number Input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  onValidation={setIsPhoneValid}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isPhoneValid || loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Method Selection */}
          {step === 'method_selection' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Login Method</h3>
                <p className="text-sm text-gray-600">How would you like to sign in?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleMethodSelection('otp')}
                  disabled={loading}
                  className="w-full flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">SMS Verification</div>
                    <div className="text-sm text-gray-600">Get a code via text message</div>
                  </div>
                </button>

                <button
                  onClick={() => handleMethodSelection('password')}
                  disabled={loading}
                  className="w-full flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <Lock className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Password</div>
                    <div className="text-sm text-gray-600">Use your account password</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-6">
              <OTPInput
                onComplete={handleOTPComplete}
                onResend={handleResendOTP}
                loading={loading}
                error={error}
                phoneNumber={phoneNumber}
              />
            </div>
          )}

          {/* Step 4: Password Input */}
          {step === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={!password || loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Alternative login options */}
          <div className="mt-6 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in with email instead
              </Link>
              
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}