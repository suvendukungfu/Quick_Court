import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookings } from '../../lib/supabase';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  Eye,
  MessageSquare,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

interface CustomerBooking {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_type: string;
  facility_city: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  special_requests?: string;
  owner_notes?: string;
  created_at: string;
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const loadBookings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await bookings.getByCustomer(user.id);

      if (error) {
        console.error('Error fetching bookings:', error);
        setError(`Failed to load bookings: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data) {
        const mappedBookings: CustomerBooking[] = data.map((booking: any) => ({
          id: booking.id,
          facility_id: booking.facility_id,
          facility_name: booking.facilities?.name || 'Unknown Facility',
          facility_type: booking.facilities?.facility_type || 'Unknown Type',
          facility_city: booking.facilities?.city || 'Unknown City',
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          total_hours: booking.total_hours,
          total_amount: booking.total_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          special_requests: booking.special_requests,
          owner_notes: booking.owner_notes,
          created_at: booking.created_at
        }));

        setBookings(mappedBookings);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockIcon className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      denied: <XCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="h-4 w-4" />;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.facility_city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings
      .filter(b => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Bookings</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadBookings}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600">View and manage your facility bookings</p>
            </div>
            <Link
              to="/venues"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Book New Facility
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={loadBookings}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? "You haven't made any bookings yet." 
                  : "No bookings match your search criteria."}
              </p>
              <Link
                to="/venues"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Book Your First Facility
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.facility_name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(booking.booking_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.facility_city}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">
                            Duration: {booking.total_hours} hour{booking.total_hours !== 1 ? 's' : ''}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${booking.total_amount.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {booking.special_requests && (
                            <span className="flex items-center text-blue-600">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Has requests
                            </span>
                          )}
                          <Link
                            to={`/book-facility/${booking.facility_id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Facility
                          </Link>
                        </div>
                      </div>
                      
                      {booking.special_requests && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Special Requests:</strong> {booking.special_requests}
                          </p>
                        </div>
                      )}
                      
                      {booking.owner_notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Owner Notes:</strong> {booking.owner_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


