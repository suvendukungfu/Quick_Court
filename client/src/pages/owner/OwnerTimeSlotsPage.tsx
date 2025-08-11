import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facilities as facilitiesApi, timeSlots as timeSlotsApi } from '../../lib/supabase';
import { 
  Plus, 
  Clock, 
  Calendar,
  DollarSign,
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Settings,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CalendarDays,
  Repeat,
  Users
} from 'lucide-react';
import { Facility, FacilityType } from '../../types/facility';

interface TimeSlot {
  id: string;
  facility_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  price_per_hour: number;
  is_available: boolean;
  max_capacity?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface WeeklySchedule {
  [key: number]: TimeSlot[];
}

export default function OwnerTimeSlotsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Form state for adding/editing time slots
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    price_per_hour: 50,
    is_available: true,
    max_capacity: 10,
    description: ''
  });

  // Redirect if not a facility owner
  if (user?.role !== 'facility_owner') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const loadFacilities = async () => {
      if (!user?.id) {
        console.log('No user ID available, skipping facilities load');
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        setLoading(true);
        
        console.log('Loading facilities for user:', user.id);
        
        let { data, error } = await facilitiesApi.getByOwner(user.id);
        
        if (error || !data) {
          console.log('getByOwner failed, trying getAll with filter...');
          const { data: allData, error: allError } = await facilitiesApi.getAll();
          
          if (allError) {
            console.error('Error fetching all facilities:', allError);
            setError(`Failed to fetch facilities: ${allError.message}`);
            setLoading(false);
            return;
          }
          
          data = allData?.filter((facility: any) => facility.owner_id === user.id) || [];
          console.log('Filtered facilities by owner:', data);
        }
        
        console.log('Facilities response:', { data, error });
        
        if (error && !data) {
          console.error('Error fetching facilities:', error);
          setError(`Failed to fetch facilities: ${error.message}`);
          setLoading(false);
          return;
        }

        console.log('Raw facilities data:', data);
        setFacilities(data || []);
        
        // Auto-select first facility if available
        if (data && data.length > 0) {
          setSelectedFacility(data[0]);
        }
        
      } catch (err) {
        console.error('Error loading facilities:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [user?.id]);

  useEffect(() => {
    if (selectedFacility) {
      loadTimeSlots(selectedFacility.id);
    }
  }, [selectedFacility]);

  const loadTimeSlots = async (facilityId: string) => {
    try {
      const { data, error } = await timeSlotsApi.getByFacility(facilityId);
      
      if (error) {
        console.error('Error fetching time slots:', error);
        // For now, use mock data if API fails
        const mockTimeSlots: TimeSlot[] = [
          {
            id: '1',
            facility_id: facilityId,
            day_of_week: 1,
            start_time: '09:00',
            end_time: '10:00',
            price_per_hour: 50,
            is_available: true,
            max_capacity: 10,
            description: 'Morning session',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            facility_id: facilityId,
            day_of_week: 1,
            start_time: '14:00',
            end_time: '15:00',
            price_per_hour: 60,
            is_available: true,
            max_capacity: 12,
            description: 'Afternoon session',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            facility_id: facilityId,
            day_of_week: 2,
            start_time: '10:00',
            end_time: '11:00',
            price_per_hour: 55,
            is_available: true,
            max_capacity: 8,
            description: 'Mid-morning session',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setTimeSlots(mockTimeSlots);
        return;
      }
      
      setTimeSlots(data || []);
    } catch (err) {
      console.error('Error loading time slots:', err);
      setError(`Failed to load time slots: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAddTimeSlot = async () => {
    if (!selectedFacility) return;

    try {
      const { data, error } = await timeSlotsApi.create({
        facility_id: selectedFacility.id,
        ...formData
      });

      if (error) {
        console.error('Error creating time slot:', error);
        alert(`Failed to add time slot: ${error.message}`);
        return;
      }

      // Add to local state
      if (data && data[0]) {
        setTimeSlots(prev => [...prev, data[0]]);
      }
      setShowAddSlot(false);
      resetForm();
    } catch (err) {
      console.error('Error adding time slot:', err);
      alert(`Failed to add time slot: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdateTimeSlot = async () => {
    if (!editingSlot) return;

    try {
      const { data, error } = await timeSlotsApi.update(editingSlot.id, formData);

      if (error) {
        console.error('Error updating time slot:', error);
        alert(`Failed to update time slot: ${error.message}`);
        return;
      }

      // Update local state
      if (data && data[0]) {
        setTimeSlots(prev => prev.map(slot => 
          slot.id === editingSlot.id ? data[0] : slot
        ));
      }
      setEditingSlot(null);
      resetForm();
    } catch (err) {
      console.error('Error updating time slot:', err);
      alert(`Failed to update time slot: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      const { error } = await timeSlotsApi.delete(slotId);

      if (error) {
        console.error('Error deleting time slot:', error);
        alert(`Failed to delete time slot: ${error.message}`);
        return;
      }

      // Remove from local state
      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
    } catch (err) {
      console.error('Error deleting time slot:', err);
      alert(`Failed to delete time slot: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:00',
      price_per_hour: 50,
      is_available: true,
      max_capacity: 10,
      description: ''
    });
  };

  const openEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      price_per_hour: slot.price_per_hour,
      is_available: slot.is_available,
      max_capacity: slot.max_capacity || 10,
      description: slot.description || ''
    });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getDayShortName = (dayOfWeek: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeSlotsByDay = (dayOfWeek: number) => {
    return timeSlots.filter(slot => slot.day_of_week === dayOfWeek);
  };

  const getWeeklySchedule = (): WeeklySchedule => {
    const schedule: WeeklySchedule = {};
    for (let i = 0; i < 7; i++) {
      schedule[i] = getTimeSlotsByDay(i);
    }
    return schedule;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading time slots...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Time Slots</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Slots Management</h1>
              <p className="text-gray-600 mt-1">Set up availability schedules for your facilities</p>
            </div>
            <Link
              to="/owner/facilities"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Back to Facilities
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Facility Selection */}
        {facilities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Facilities Available</h3>
            <p className="text-gray-600 mb-6">
              You need to create a facility first before you can manage time slots.
            </p>
            <Link
              to="/owner/post-facility"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Facility
            </Link>
          </div>
        ) : (
          <>
            {/* Facility Selector */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Facility</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map((facility) => (
                  <button
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedFacility?.id === facility.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                      {selectedFacility?.id === facility.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{facility.facility_type}</p>
                    <p className="text-sm text-gray-500">{facility.city}, {facility.state}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedFacility && (
              <>
                {/* Weekly Schedule View */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Weekly Schedule - {selectedFacility.name}
                    </h2>
                    <button
                      onClick={() => setShowAddSlot(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Time Slot
                    </button>
                  </div>

                  {/* Week Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentWeek(prev => {
                        const newDate = new Date(prev);
                        newDate.setDate(newDate.getDate() - 7);
                        return newDate;
                      })}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-medium text-gray-900">
                      Week of {currentWeek.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <button
                      onClick={() => setCurrentWeek(prev => {
                        const newDate = new Date(prev);
                        newDate.setDate(newDate.getDate() + 7);
                        return newDate;
                      })}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Weekly Grid */}
                  <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 7 }, (_, i) => {
                      const daySlots = getTimeSlotsByDay(i);
                      return (
                        <div key={i} className="min-h-[200px]">
                          <div className="text-center mb-2">
                            <div className="text-sm font-medium text-gray-900">
                              {getDayShortName(i)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getDayName(i)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {daySlots.length === 0 ? (
                              <div className="text-center py-4 text-gray-400 text-sm">
                                No slots
                              </div>
                            ) : (
                              daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className={`p-2 rounded-lg border text-xs ${
                                    slot.is_available
                                      ? 'border-green-200 bg-green-50'
                                      : 'border-red-200 bg-red-50'
                                  }`}
                                >
                                  <div className="font-medium text-gray-900">
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                  </div>
                                  <div className="text-gray-600">
                                    ${slot.price_per_hour}/hr
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className={`px-1 py-0.5 rounded text-xs ${
                                      slot.is_available
                                        ? 'bg-green-200 text-green-800'
                                        : 'bg-red-200 text-red-800'
                                    }`}>
                                      {slot.is_available ? 'Available' : 'Unavailable'}
                                    </span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => openEditSlot(slot)}
                                        className="p-1 hover:bg-gray-200 rounded"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTimeSlot(slot.id)}
                                        className="p-1 hover:bg-red-100 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Total Slots</p>
                        <p className="text-2xl font-bold text-gray-900">{timeSlots.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Available</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {timeSlots.filter(slot => slot.is_available).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <DollarSign className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Avg Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${timeSlots.length > 0 
                            ? Math.round(timeSlots.reduce((sum, slot) => sum + slot.price_per_hour, 0) / timeSlots.length)
                            : 0
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {timeSlots.reduce((sum, slot) => sum + (slot.max_capacity || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Time Slot Modal */}
      {(showAddSlot || editingSlot) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
              </h3>
              <button
                onClick={() => {
                  setShowAddSlot(false);
                  setEditingSlot(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingSlot) {
                handleUpdateTimeSlot();
              } else {
                handleAddTimeSlot();
              }
            }}>
              <div className="space-y-4">
                {/* Day of Week */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Hour ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Max Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Morning session, Peak hours, etc."
                  />
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                    Available for booking
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSlot(false);
                    setEditingSlot(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSlot ? 'Update Slot' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
