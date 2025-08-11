import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { properties } from '../../lib/supabase';
import { Trophy, MapPin, DollarSign, Clock, Star } from 'lucide-react';

interface PropertyFormData {
  property_name: string;
  property_type: string;
  address: string;
  current_status: 'active' | 'inactive' | 'maintenance';
  is_sold: boolean;
  current_booking_start: string;
  current_booking_end: string;
  next_available_time: string;
  total_booked_hours: number;
  monthly_booked_hours: number;
  description: string;
  sports: string[];
  amenities: string[];
  pricePerHour: number;
  operatingHours: {
    start: string;
    end: string;
  };
  photos: string[];
  contactPhone: string;
  contactEmail: string;
}

export default function PostPropertyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    property_name: '',
    property_type: '',
    address: '',
    current_status: 'active',
    is_sold: false,
    current_booking_start: '',
    current_booking_end: '',
    next_available_time: '',
    total_booked_hours: 0,
    monthly_booked_hours: 0,
    description: '',
    sports: [],
    amenities: [],
    pricePerHour: 0,
    operatingHours: {
      start: '09:00',
      end: '18:00'
    },
    photos: [],
    contactPhone: '',
    contactEmail: user?.email || ''
  });



  // Redirect if not a facility owner
  if (user?.role !== 'facility_owner') {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PropertyFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare property data for Supabase with new schema
      const propertyData = {
        user_id: user?.id,
        property_name: formData.property_name,
        property_type: formData.property_type,
        address: formData.address,
        description: formData.description,
        current_status: formData.current_status,
        is_sold: formData.is_sold,
        price_per_hour: formData.pricePerHour,
        operating_hours: formData.operatingHours,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail
      };

      // Save to Supabase
      const { data, error } = await properties.create(propertyData);
      
      if (error) {
        console.error('Error creating property:', error);
        setError(`Failed to post property: ${error.message}`);
        return;
      }

      console.log('Property created successfully:', data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating property:', err);
      setError('Failed to post property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-green-600 mb-4">
              <Trophy className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Posted Successfully!</h2>
            <p className="text-gray-600">Your property is now visible to users for booking.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Post Your Property</h1>
          <p className="text-gray-600 mt-2">Add your sports facility to start receiving bookings</p>
        </div>

        {/* Property Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
            </div>

            <div>
              <label htmlFor="property_name" className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                id="property_name"
                name="property_name"
                required
                value={formData.property_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Downtown Sports Complex"
              />
            </div>

            <div>
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                id="property_type"
                name="property_type"
                required
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select property type</option>
                <option value="sports_complex">Sports Complex</option>
                <option value="basketball_court">Basketball Court</option>
                <option value="tennis_court">Tennis Court</option>
                <option value="swimming_pool">Swimming Pool</option>
                <option value="fitness_center">Fitness Center</option>
                <option value="football_field">Football Field</option>
                <option value="cricket_ground">Cricket Ground</option>
                <option value="badminton_court">Badminton Court</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your facility, its features, and what makes it special..."
              />
              <p className="text-xs text-gray-500 mt-1">Description will be auto-generated if not provided</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full address of your facility"
              />
            </div>

            {/* Note about auto-generated fields */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-600" />
                  Auto-Generated Fields
                </h3>
                <p className="text-sm text-blue-700">
                  Sports and amenities will be automatically generated based on your property type. 
                  You can add these fields to your database later if needed.
                </p>
              </div>
            </div>

            {/* Note about pricing and hours */}
            <div className="md:col-span-2">
                              <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                  Pricing & Operating Hours
                </h3>
            </div>

            <div className="md:col-span-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  Pricing and operating hours will use default values. 
                  You can add these fields to your database later if needed.
                </p>
              </div>
            </div>



            {/* Note about contact information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
            </div>
            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Contact information fields are not available in the current database schema. 
                  You can add these fields later if needed.
                </p>
              </div>
            </div>

            {/* Property Status & Management */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-blue-600" />
                Property Status & Management
              </h3>
            </div>

            <div>
              <label htmlFor="current_status" className="block text-sm font-medium text-gray-700 mb-2">
                Current Status *
              </label>
              <select
                id="current_status"
                name="current_status"
                required
                value={formData.current_status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Status
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_sold"
                  name="is_sold"
                  checked={formData.is_sold}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_sold: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_sold" className="ml-2 text-sm text-gray-700">
                  Mark as Sold
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="current_booking_start" className="block text-sm font-medium text-gray-700 mb-2">
                Current Booking Start
              </label>
              <input
                type="datetime-local"
                id="current_booking_start"
                name="current_booking_start"
                value={formData.current_booking_start}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="current_booking_end" className="block text-sm font-medium text-gray-700 mb-2">
                Current Booking End
              </label>
              <input
                type="datetime-local"
                id="current_booking_end"
                name="current_booking_end"
                value={formData.current_booking_end}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="next_available_time" className="block text-sm font-medium text-gray-700 mb-2">
                Next Available Time
              </label>
              <input
                type="datetime-local"
                id="next_available_time"
                name="next_available_time"
                value={formData.next_available_time}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="total_booked_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Total Booked Hours
              </label>
              <input
                type="number"
                id="total_booked_hours"
                name="total_booked_hours"
                min="0"
                step="0.5"
                value={formData.total_booked_hours}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="monthly_booked_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Booked Hours
              </label>
              <input
                type="number"
                id="monthly_booked_hours"
                name="monthly_booked_hours"
                min="0"
                step="0.5"
                value={formData.monthly_booked_hours}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/owner/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Posting Property...' : 'Post Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
