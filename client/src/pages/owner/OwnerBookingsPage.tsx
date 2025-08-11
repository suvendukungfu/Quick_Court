import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookings as bookingsApi } from '../../lib/supabase';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Filter,
  Search,
  MoreVertical,
  Building,
  User,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Clock3,
  Star
} from 'lucide-react';

interface Booking {
  id: string;
  facility_id: string;
  customer_id: string;
  time_slot_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  special_requests?: string;
  owner_notes?: string;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
  facilities: {
    id: string;
    name: string;
    facility_type: string;
    address: string;
    city: string;
    state: string;
    contact_phone?: string;
    contact_email?: string;
    owner_id: string;
  };
  users: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export default function OwnerBookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [ownerNotes, setOwnerNotes] = useState('');

  // Redirect if not a facility owner
  if (user?.role !== 'facility_owner') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const loadBookings = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      setLoading(true);

      const { data, error } = await bookingsApi.getByOwner(user.id);

      if (error) {
        console.error('Error fetching bookings:', error);
        setError(`Failed to load bookings: ${error.message}`);
        setLoading(false);
        return;
      }

      setBookings(data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setProcessingAction(bookingId);
      
      const { data, error } = await bookingsApi.update(bookingId, {
        status: 'approved',
        owner_notes: ownerNotes || null
      });

      if (error) {
        console.error('Error approving booking:', error);
        alert(`Failed to approve booking: ${error.message}`);
        return;
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'approved', owner_notes: ownerNotes || null }
          : booking
      ));

      setShowBookingModal(false);
      setSelectedBooking(null);
      setOwnerNotes('');
      alert('Booking approved successfully!');
    } catch (err) {
      console.error('Error approving booking:', err);
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDenyBooking = async (bookingId: string) => {
    try {
      setProcessingAction(bookingId);
      
      const { data, error } = await bookingsApi.update(bookingId, {
        status: 'denied',
        owner_notes: ownerNotes || null
      });

      if (error) {
        console.error('Error denying booking:', error);
        alert(`Failed to deny booking: ${error.message}`);
        return;
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'denied', owner_notes: ownerNotes || null }
          : booking
      ));

      setShowBookingModal(false);
      setSelectedBooking(null);
      setOwnerNotes('');
      alert('Booking denied successfully!');
    } catch (err) {
      console.error('Error denying booking:', err);
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setOwnerNotes(booking.owner_notes || '');
    setShowBookingModal(true);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock3 className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.facilities.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.users.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    denied: bookings.filter(b => b.status === 'denied').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings
      .filter(b => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadBookings}
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
              <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 mt-1">Manage booking requests for your facilities</p>
            </div>
            <button
              onClick={loadBookings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Denied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.denied}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by facility, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filters'}
            </h3>
            <p className="text-gray-600">
              {bookings.length === 0 
                ? 'When customers book your facilities, their requests will appear here.'
                : 'Try adjusting your search terms or filters to see more results.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{booking.facilities.name}</h3>
                        <p className="text-sm text-gray-600">Booked by {booking.users.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                      <button
                        onClick={() => openBookingDetails(booking)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>${booking.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{booking.total_hours} hours</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Requested on {formatDate(booking.created_at)}</span>
                    {booking.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openBookingDetails(booking)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openBookingDetails(booking)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedBooking(null);
                    setOwnerNotes('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Facility Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Facility</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedBooking.facilities.name}</p>
                        <p className="text-sm text-gray-600">{selectedBooking.facilities.facility_type}</p>
                        <p className="text-sm text-gray-600">
                          {selectedBooking.facilities.address}, {selectedBooking.facilities.city}, {selectedBooking.facilities.state}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusIcon(selectedBooking.status)}
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedBooking.users.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedBooking.users.email}</p>
                      </div>
                      {selectedBooking.users.phone && (
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{selectedBooking.users.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{formatDate(selectedBooking.booking_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium">
                          {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{selectedBooking.total_hours} hours</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">${selectedBooking.total_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.special_requests && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedBooking.special_requests}</p>
                    </div>
                  </div>
                )}

                {/* Owner Notes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Notes (Optional)</h4>
                  <textarea
                    value={ownerNotes}
                    onChange={(e) => setOwnerNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes for the customer..."
                  />
                </div>

                {/* Action Buttons */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleDenyBooking(selectedBooking.id)}
                      disabled={processingAction === selectedBooking.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingAction === selectedBooking.id ? 'Processing...' : 'Deny Booking'}
                    </button>
                    <button
                      onClick={() => handleApproveBooking(selectedBooking.id)}
                      disabled={processingAction === selectedBooking.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingAction === selectedBooking.id ? 'Processing...' : 'Approve Booking'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
