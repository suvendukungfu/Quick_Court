import React, { useState, useRef, useEffect } from 'react';
import { Loader, RefreshCw } from 'lucide-react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  loading?: boolean;
  error?: string;
  phoneNumber?: string;
  resendCooldown?: number; // seconds
}

export default function OTPInput({
  length = 6,
  onComplete,
  onResend,
  loading = false,
  error,
  phoneNumber,
  resendCooldown = 60
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all fields are filled
    const otpString = newOtp.join('');
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits.length > 0) {
      const newOtp = new Array(length).fill('');
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(digits.length, length - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      
      // Call onComplete if all fields are filled
      if (digits.length === length) {
        onComplete(digits);
      }
    }
  };

  const handleResend = () => {
    if (resendTimer > 0 || !onResend) return;
    
    setResendTimer(resendCooldown);
    setOtp(new Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    onResend();
  };

  const clearOTP = () => {
    setOtp(new Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Phone number display */}
      {phoneNumber && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to
          </p>
          <p className="font-medium text-gray-900">{phoneNumber}</p>
        </div>
      )}

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            disabled={loading}
            className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' :
              digit ? 'border-blue-500 bg-blue-50' :
              activeIndex === index ? 'border-blue-500' :
              'border-gray-300 hover:border-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Verifying OTP...
          </div>
        </div>
      )}

      {/* Resend OTP */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">Didn't receive the code?</p>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
          
          <button
            type="button"
            onClick={clearOTP}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-700 disabled:text-gray-400"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Enter the 6-digit code or paste it from your messages
        </p>
      </div>
    </div>
  );
}