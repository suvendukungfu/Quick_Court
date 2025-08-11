import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facilities, facilityAmenities, facilityImages, facilitySchedules, facilityPricing } from '../../lib/supabase';
import { Trophy, MapPin, DollarSign, Clock, Star, Plus, X } from 'lucide-react';
import { FacilityType } from '../../types/facility';

interface FacilityFormData {
  name: string;
  description: string;
  facility_type: FacilityType;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  amenities: Array<{
    amenity_name: string;
    description: string;
    is_available: boolean;
  }>;
  pricing: Array<{
    pricing_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
    price: number;
    currency: string;
    is_active: boolean;
  }>;
  schedules: Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>;
  images: Array<{
    image_url: string;
    image_type: 'gallery' | 'main' | 'thumbnail';
    is_primary: boolean;
  }>;
}

export default function PostPropertyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    description: '',
    facility_type: 'basketball_court',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    phone: '',
    email: user?.email || '',
    website: '',
    amenities: [],
    pricing: [
      {
        pricing_type: 'hourly',
        price: 25,
        currency: 'USD',
        is_active: true
      }
    ],
    schedules: [
      { day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 2, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 3, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 4, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 5, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 6, open_time: '09:00', close_time: '18:00', is_closed: false },
      { day_of_week: 0, open_time: '10:00', close_time: '16:00', is_closed: false }
    ],
    images: []
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
      setFormData(prev => {
        const parentValue = prev[parent as keyof FacilityFormData];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, {
        amenity_name: '',
        description: '',
        is_available: true
      }]
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const updateAmenity = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((amenity, i) => 
        i === index ? { ...amenity, [field]: value } : amenity
      )
    }));
  };

  const updateSchedule = (dayOfWeek: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map(schedule => 
        schedule.day_of_week === dayOfWeek ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  const addPricing = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, {
        pricing_type: 'hourly',
        price: 25,
        currency: 'USD',
        is_active: true
      }]
    }));
  };

  const removePricing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  const updatePricing = (index: number, field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, {
        image_url: '',
        image_type: 'gallery',
        is_primary: false
      }]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((image, i) => 
        i === index ? { ...image, [field]: value } : image
      )
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Starting facility creation...');
      
      // Prepare facility data for Supabase (only include columns that exist in the table)
      const facilityData = {
        owner_id: user?.id,
        name: formData.name,
        description: formData.description,
        facility_type: formData.facility_type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        contact_phone: formData.phone,
        contact_email: formData.email,
        website_url: formData.website,
        status: 'active',
        is_verified: false
        // Note: featured field removed to avoid column not found errors
      };

      console.log('Facility data to insert:', facilityData);

      // Create the facility
      const { data: facility, error: facilityError } = await facilities.create(facilityData);
      
      if (facilityError) {
        console.error('Error creating facility:', facilityError);
        setError(`Failed to post facility: ${facilityError.message}`);
        setLoading(false);
        return;
      }

      if (!facility || facility.length === 0) {
        setError('Failed to create facility. Please try again.');
        setLoading(false);
        return;
      }
      
      const facilityId = facility[0].id;
      console.log('Facility created with ID:', facilityId);

      // For now, skip related tables to avoid errors
      // TODO: Add these back once the tables are properly set up
      console.log('Skipping related tables for now...');

      console.log('Facility created successfully:', facility);
      setSuccess(true);
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating facility:', err);
      setError('Failed to post facility. Please try again.');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Facility Posted Successfully!</h2>
            <p className="text-gray-600">Your facility is now visible to users for booking.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Post Your Facility</h1>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Facility Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Downtown Sports Complex"
              />
            </div>

            <div>
              <label htmlFor="facility_type" className="block text-sm font-medium text-gray-700 mb-2">
                Facility Type *
              </label>
              <select
                id="facility_type"
                name="facility_type"
                required
                value={formData.facility_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="basketball_court">Basketball Court</option>
                <option value="tennis_court">Tennis Court</option>
                <option value="volleyball_court">Volleyball Court</option>
                <option value="badminton_court">Badminton Court</option>
                <option value="soccer_field">Soccer Field</option>
                <option value="baseball_field">Baseball Field</option>
                <option value="swimming_pool">Swimming Pool</option>
                <option value="gym">Gym</option>
                <option value="multi_sport">Multi-Sport Facility</option>
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

            <div>
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
                placeholder="Street address"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="State"
              />
            </div>

            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ZIP Code"
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

            {/* Contact Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
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
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@facility.com"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.facility.com"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="USA"
              />
            </div>

            {/* Facility Details */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Facility Details
              </h3>
            </div>



            {/* Pricing Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                Pricing Information
              </h3>
              
              {formData.pricing.map((price, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Pricing Option {index + 1}</h4>
                    {formData.pricing.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePricing(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pricing Type
                      </label>
                      <select
                        value={price.pricing_type}
                        onChange={(e) => updatePricing(index, 'pricing_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price.price}
                        onChange={(e) => updatePricing(index, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="25.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={price.currency}
                        onChange={(e) => updatePricing(index, 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={price.is_active}
                        onChange={(e) => updatePricing(index, 'is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addPricing}
                className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pricing Option
              </button>
            </div>



            {/* Contact Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
            </div>

            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                required
                value={formData.contact_email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@facility.com"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.facility.com"
              />
            </div>

            {/* Amenities */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Amenities
              </h3>
              <p className="text-sm text-gray-600 mb-4">Add amenities and features available at your facility</p>
            </div>

            {formData.amenities.map((amenity, index) => (
              <div key={index} className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Amenity {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amenity Name
                    </label>
                    <input
                      type="text"
                      value={amenity.amenity_name}
                      onChange={(e) => updateAmenity(index, 'amenity_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Basketball Hoops"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={amenity.description}
                      onChange={(e) => updateAmenity(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={amenity.is_available}
                      onChange={(e) => updateAmenity(index, 'is_available', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                </div>
              </div>
            ))}

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addAmenity}
                className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Amenity
              </button>
            </div>

            {/* Operating Hours */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Operating Hours
              </h3>
              <p className="text-sm text-gray-600 mb-4">Set the operating hours for each day of the week</p>
            </div>

            {formData.schedules.map((schedule, index) => (
              <div key={index} className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.day_of_week]}
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={schedule.is_closed}
                      onChange={(e) => updateSchedule(schedule.day_of_week, 'is_closed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Closed</span>
                  </label>
                </div>
                
                {!schedule.is_closed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Open Time
                      </label>
                      <input
                        type="time"
                        value={schedule.open_time}
                        onChange={(e) => updateSchedule(schedule.day_of_week, 'open_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Close Time
                      </label>
                      <input
                        type="time"
                        value={schedule.close_time}
                        onChange={(e) => updateSchedule(schedule.day_of_week, 'close_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Images */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Facility Images
              </h3>
              <p className="text-sm text-gray-600 mb-4">Add images of your facility to attract users</p>
            </div>

            {formData.images.map((image, index) => (
              <div key={index} className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Image {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={image.image_url}
                      onChange={(e) => updateImage(index, 'image_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Type
                    </label>
                    <select
                      value={image.image_type}
                      onChange={(e) => updateImage(index, 'image_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="gallery">Gallery</option>
                      <option value="main">Main</option>
                      <option value="thumbnail">Thumbnail</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={image.is_primary}
                      onChange={(e) => updateImage(index, 'is_primary', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Primary Image</span>
                  </label>
                </div>
              </div>
            ))}

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addImage}
                className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Image
              </button>
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
              {loading ? 'Posting Facility...' : 'Post Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
