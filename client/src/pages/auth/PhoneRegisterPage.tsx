import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OTPService } from '../../lib/otpService';
import { Trophy, ArrowLeft, Loader, Check, Smartphone } from 'lucide-react';
import PhoneInput from '../../components/auth/PhoneInput';
import OTPInput from '../../components/auth/OTPInput';

type RegisterStep = 'details' | 'otp' | 'success';

interface RegistrationData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: 'customer' | 'facility_owner';
  preferredAuthMethod: 'password' | 'otp' | 'both';
}

export default function PhoneRegisterPage() {
  const [step, setStep] = useState<RegisterStep>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'customer',
    preferredAuthMethod: 'both'
  });

  const { register, isAuthenticated, user } = useAuth();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !formData.phoneNumber || !formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if phone number already exists
      const { exists } = await OTPService.checkPhoneExists(formData.phoneNumber);
      
      if (exists) {
        setError('This phone number is already registered. Please use a different number or sign in.');
        setLoading(false);
        return;
      }

      // Send OTP for phone verification
      const response = await OTPService.sendOTP(formData.phoneNumber, 'registration');
      
      if (response.success) {
        setStep('otp');
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otpCode: string) => {
    setLoading(true);
    setError('');

    try {
      // Verify OTP
      const otpResponse = await OTPService.verifyOTP(formData.phoneNumber, otpCode, 'registration');
      
      if (!otpResponse.success) {
        setError(otpResponse.message);
        setLoading(false);
        return;
      }

      // Register user with verified phone number
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phoneNumber,
        phoneVerified: true,
        preferredAuthMethod: formData.preferredAuthMethod
      };

      const success = await register(registrationData);
      
      if (success) {
        setStep('success');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Failed to verify phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await OTPService.sendOTP(formData.phoneNumber, 'registration');
      if (!response.success) {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-purple-600 rounded-2xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Join QuickCourt</h2>
          <p className="mt-2 text-gray-600">
            {step === 'details' && 'Create your account with phone verification'}
            {step === 'otp' && 'Verify your phone number'}
            {step === 'success' && 'Welcome to QuickCourt!'}
          </p>
        </div>

        {/* Back button */}
        {step === 'otp' && (
          <button
            onClick={() => setStep('details')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to details
          </button>
        )}

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Registration Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                  onValidation={setIsPhoneValid}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Create a password"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="customer">Customer</option>
                  <option value="facility_owner">Facility Owner</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferredAuthMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Login Method
                </label>
                <select
                  id="preferredAuthMethod"
                  name="preferredAuthMethod"
                  value={formData.preferredAuthMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="both">Both (OTP & Password)</option>
                  <option value="otp">OTP Only</option>
                  <option value="password">Password Only</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">You can change this later in your profile</p>
              </div>

              <button
                type="submit"
                disabled={!isPhoneValid || !formData.fullName || !formData.email || !formData.password || loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify Phone Number'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Your Phone</h3>
                <p className="text-sm text-gray-600">
                  We've sent a verification code to your phone number
                </p>
              </div>

              <OTPInput
                onComplete={handleOTPComplete}
                onResend={handleResendOTP}
                loading={loading}
                error={error}
                phoneNumber={formData.phoneNumber}
              />
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Created Successfully!</h3>
                <p className="text-sm text-gray-600">
                  Your phone number has been verified and your account is ready to use.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors inline-block"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {/* Alternative options */}
          {step === 'details' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}