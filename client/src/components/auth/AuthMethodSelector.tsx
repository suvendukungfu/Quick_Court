import React from 'react';
import { MessageSquare, Lock, Smartphone, Mail } from 'lucide-react';

interface AuthMethodSelectorProps {
  onSelectMethod: (method: 'otp' | 'password') => void;
  userPreference?: 'password' | 'otp' | 'both';
  loading?: boolean;
}

export default function AuthMethodSelector({
  onSelectMethod,
  userPreference = 'both',
  loading = false
}: AuthMethodSelectorProps) {
  // If user has a specific preference, show only that option
  if (userPreference === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">SMS Verification</h3>
          <p className="text-sm text-gray-600">We'll send a verification code to your phone</p>
        </div>
        <button
          onClick={() => onSelectMethod('otp')}
          disabled={loading}
          className="w-full flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <MessageSquare className="h-6 w-6 mr-3" />
          <div>
            <div className="font-medium">Send SMS Code</div>
            <div className="text-sm opacity-90">Get verification code via text</div>
          </div>
        </button>
      </div>
    );
  }

  if (userPreference === 'password') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Password Login</h3>
          <p className="text-sm text-gray-600">Enter your account password</p>
        </div>
        <button
          onClick={() => onSelectMethod('password')}
          disabled={loading}
          className="w-full flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Lock className="h-6 w-6 mr-3" />
          <div>
            <div className="font-medium">Use Password</div>
            <div className="text-sm opacity-90">Sign in with your password</div>
          </div>
        </button>
      </div>
    );
  }

  // Show both options for 'both' preference
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Login Method</h3>
        <p className="text-sm text-gray-600">How would you like to sign in?</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelectMethod('otp')}
          disabled={loading}
          className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <div className="bg-blue-100 p-2 rounded-lg mr-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium text-gray-900">SMS Verification</div>
            <div className="text-sm text-gray-600">Get a code via text message</div>
          </div>
        </button>

        <button
          onClick={() => onSelectMethod('password')}
          disabled={loading}
          className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <div className="bg-blue-100 p-2 rounded-lg mr-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium text-gray-900">Password</div>
            <div className="text-sm text-gray-600">Use your account password</div>
          </div>
        </button>
      </div>

      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Alternative options</span>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Sign in with email instead
          </Link>
        </div>
      </div>
    </div>
  );
}