import React, { useState } from 'react';
import { Phone, Check, AlertCircle } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  onValidation,
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  className = ""
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic international phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Add + if not present and there are digits
    if (formatted && !formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    
    onChange(formattedValue);
    
    // Validate if there's a value
    if (formattedValue) {
      const valid = validatePhoneNumber(formattedValue);
      setIsValid(valid);
      onValidation?.(valid);
    } else {
      setIsValid(null);
      onValidation?.(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Final validation on blur
    if (value) {
      const valid = validatePhoneNumber(value);
      setIsValid(valid);
      onValidation?.(valid);
    }
  };

  const getInputClasses = () => {
    let classes = `w-full pl-10 pr-10 py-3 border rounded-lg transition-colors ${className}`;
    
    if (disabled) {
      classes += ' bg-gray-100 cursor-not-allowed';
    } else if (isValid === true) {
      classes += ' border-green-300 focus:border-green-500 focus:ring-green-500';
    } else if (isValid === false) {
      classes += ' border-red-300 focus:border-red-500 focus:ring-red-500';
    } else {
      classes += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    }
    
    return classes;
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Phone className={`h-5 w-5 ${
          isValid === true ? 'text-green-500' :
          isValid === false ? 'text-red-500' :
          isFocused ? 'text-blue-500' : 'text-gray-400'
        }`} />
      </div>
      
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={getInputClasses()}
      />
      
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isValid === true && (
          <Check className="h-5 w-5 text-green-500" />
        )}
        {isValid === false && (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      
      {/* Validation message */}
      {isValid === false && value && (
        <p className="mt-1 text-sm text-red-600">
          Please enter a valid international phone number (e.g., +1234567890)
        </p>
      )}
      
      {/* Format hint */}
      {isFocused && !value && (
        <p className="mt-1 text-sm text-gray-500">
          Format: +[country code][phone number] (e.g., +1234567890)
        </p>
      )}
    </div>
  );
}