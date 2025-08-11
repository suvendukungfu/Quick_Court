import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facilities as facilitiesApi, bookings as bookingsApi, timeSlots as timeSlotsApi } from '../../lib/supabase';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  CreditCard,
  MessageSquare,
  Star
} from 'lucide-react';
import { Facility, FacilityType } from '../../types/facility';

interface TimeSlot {
  id: string;
  facility_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  price_per_hour: number;
  is_available: boolean;
  max_capacity?: number;
  description?: string;
}

export default function BookFacilityPage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Redirect if not a customer
  if (user?.role !== 'customer') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (facilityId) {
      loadFacility();
    }
  }, [facilityId]);

  useEffect(() => {
    if (facility) {
      loadTimeSlots();
    }
  }, [facility]);

  useEffect(() => {
    calculateTotal();
  }, [selectedStartTime, selectedEndTime, selectedSlot]);

  const loadFacility = async () => {
    if (!facilityId) return;

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await facilitiesApi.getById(facilityId);

      if (error) {
        console.error('Error fetching facility:', error);
        setError(`Failed to load facility: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        setError('Facility not found');
        setLoading(false);
        return;
      }

      setFacility(data);
    } catch (err) {
      console.error('Error loading facility:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!facility) return;

    try {
      const { data, error } = await timeSlotsApi.getByFacility(facility.id);

      if (error) {
        console.error('Error fetching time slots:', error);
        // Use mock data for now
        const mockSlots: TimeSlot[] = [
          {
            id: '1',
            facility_id: facility.id,
            day_of_week: 1,
            start_time: '09:00',
            end_time: '10:00',
            price_per_hour: 50,
            is_available: true,
            max_capacity: 10,
            description: 'Morning session'
          },
          {
            id: '2',
            facility_id: facility.id,
            day_of_week: 1,
            start_time: '14:00',
            end_time: '15:00',
            price_per_hour: 60,
            is_available: true,
            max_capacity: 12,
            description: 'Afternoon session'
          },
          {
            id: '3',
            facility_id: facility.id,
            day_of_week: 2,
            start_time: '10:00',
            end_time: '11:00',
            price_per_hour: 55,
            is_available: true,
            max_capacity: 8,
            description: 'Mid-morning session'
          }
        ];
        setTimeSlots(mockSlots);
        return;
      }

      setTimeSlots(data || []);
    } catch (err) {
      console.error('Error loading time slots:', err);
    }
  };

  const calculateTotal = () => {
    if (!selectedStartTime || !selectedEndTime || !selectedSlot) {
      setTotalHours(0);
      setTotalAmount(0);
      return;
    }

    const start = new Date(`2000-01-01T${selectedStartTime}`);
    const end = new Date(`2000-01-01T${selectedEndTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    setTotalHours(hours);
    setTotalAmount(hours * selectedSlot.price_per_hour);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableSlotsForDate = (date: string) => {
    if (!date) return [];
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    return timeSlots.filter(slot => 
      slot.day_of_week === dayOfWeek && 
      slot.is_available
    );
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSelectedStartTime(slot.start_time);
    setSelectedEndTime(slot.end_time);
  };

  const handleSubmitBooking = async () => {
    if (!facility || !selectedDate || !selectedStartTime || !selectedEndTime || !selectedSlot) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      alert('Please log in to make a booking');
      return;
    }

    try {
      setSubmitting(true);

      // Check for booking conflicts
      const { data: conflicts } = await bookingsApi.checkConflicts(
        facility.id,
        selectedDate,
        selectedStartTime,
        selectedEndTime
      );

      if (conflicts && conflicts.length > 0) {
        alert('This time slot is already booked. Please choose a different time.');
        return;
      }

      // Create booking
      const bookingData = {
        facility_id: facility.id,
        customer_id: user.id,
        time_slot_id: selectedSlot.id,
        booking_date: selectedDate,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
        total_hours: totalHours,
        total_amount: totalAmount,
        special_requests: specialRequests || null,
        status: 'pending',
        payment_status: 'pending'
      };

      const { data, error } = await bookingsApi.create(bookingData);

      if (error) {
        console.error('Error creating booking:', error);
        alert(`Failed to create booking: ${error.message}`);
        return;
      }

      if (data && data[0]) {
        setShowConfirmation(true);
        // Reset form
        setSelectedDate('');
        setSelectedStartTime('');
        setSelectedEndTime('');
        setSelectedSlot(null);
        setSpecialRequests('');
        setTotalHours(0);
        setTotalAmount(0);
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getFacilityTypeLabel = (type: FacilityType) => {
    const typeLabels: Record<FacilityType, string> = {
      basketball_court: 'Basketball Court',
      tennis_court: 'Tennis Court',
      football_field: 'Football Field',
      cricket_ground: 'Cricket Ground',
      badminton_court: 'Badminton Court',
      volleyball_court: 'Volleyball Court',
      swimming_pool: 'Swimming Pool',
      gym: 'Gym',
      yoga_studio: 'Yoga Studio',
      other: 'Other'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading facility details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Facility</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/venues')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Facility Not Found</h2>
          <button
            onClick={() => navigate('/venues')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = getAvailableSlotsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/venues')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Book Facility</h1>
                <p className="text-gray-600">Reserve your preferred time slot</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Facility Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Facility Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{getFacilityTypeLabel(facility.facility_type)}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{facility.address}, {facility.city}, {facility.state}</span>
                  </div>

                  {facility.contact_phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{facility.contact_phone}</span>
                    </div>
                  )}

                  {facility.contact_email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{facility.contact_email}</span>
                    </div>
                  )}

                  {facility.website_url && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={facility.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {facility.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{facility.description}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {facility.is_verified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    facility.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {facility.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date & Time</h2>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Available Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarDays className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No available slots for {new Date(selectedDate).toLocaleDateString()}</p>
                      <p className="text-sm">Try selecting a different date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            selectedSlot?.id === slot.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Clock3 className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="font-medium text-gray-900">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </div>
                            {selectedSlot?.id === slot.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              <DollarSign className="w-3 h-3 inline mr-1" />
                              {slot.price_per_hour}/hr
                            </span>
                            {slot.max_capacity && (
                              <span className="text-gray-600">
                                <Users className="w-3 h-3 inline mr-1" />
                                Max {slot.max_capacity}
                              </span>
                            )}
                          </div>
                          {slot.description && (
                            <p className="text-xs text-gray-500 mt-1">{slot.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Summary */}
              {selectedSlot && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{totalHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">${selectedSlot.price_per_hour}/hour</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span className="text-lg">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements or requests..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitBooking}
                disabled={!selectedSlot || !selectedDate || submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Submit Booking Request
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Your booking request will be sent to the facility owner for approval.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Request Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your booking request has been sent to the facility owner. You'll receive a notification once they approve or deny your request.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    navigate('/dashboard');
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    navigate('/venues');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
