import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facilities as facilitiesApi } from '../../lib/supabase';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { Facility, FacilityType } from '../../types/facility';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalBookings: 0,
    monthlyRevenue: 0
  });

  // Add debugging for user state
  console.log('OwnerDashboard: User state:', {
    user: user,
    role: user?.role,
    isAuthenticated: !!user,
    loading: loading
  });

  // Redirect if not a facility owner
  if (user && user.role !== 'facility_owner') {
    console.log('OwnerDashboard: Redirecting - user role is:', user.role);
    navigate('/login');
    return null;
  }

  // Show loading if user is not loaded yet
  if (!user && !loading) {
    console.log('OwnerDashboard: No user and not loading, redirecting to login');
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
        setError(null); // Clear any previous errors
        setLoading(true);
        
        // Fetch facilities from Supabase
        console.log('Loading facilities for user:', user.id);
        
        // First try to get facilities by owner, if that fails, get all and filter
        let { data, error } = await facilitiesApi.getByOwner(user.id);
        
        // If getByOwner fails, fallback to getAll and filter
        if (error || !data) {
          console.log('getByOwner failed, trying getAll with filter...');
          const { data: allData, error: allError } = await facilitiesApi.getAll();
          
          if (allError) {
            console.error('Error fetching all facilities:', allError);
            setError(`Failed to fetch facilities: ${allError.message}`);
            setLoading(false);
            return;
          }
          
          // Filter facilities by owner_id
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
        
        // Calculate stats
        const totalBookings = (data || []).reduce((sum: number, facility: any) => sum + 0, 0); // Will be updated when bookings are implemented
        const monthlyRevenue = (data || []).reduce((sum: number, facility: any) => sum + 0, 0); // Will be updated when pricing is implemented
        
        setStats({
          totalProperties: (data || []).length,
          activeProperties: (data || []).filter((f: any) => f.status === 'active').length,
          totalBookings,
          monthlyRevenue
        });
      } catch (err) {
        console.error('Error loading facilities:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    // Only load facilities when user is available
    if (user) {
      console.log('OwnerDashboard: User available, loading facilities...');
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, stopping loading state');
        setLoading(false);
        setError('Loading timeout - please refresh the page');
      }, 10000); // 10 second timeout
      
      loadFacilities().finally(() => {
        clearTimeout(timeoutId);
      });
    } else {
      console.log('OwnerDashboard: No user available, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const handleDeleteFacility = async (facilityId: string) => {
    if (window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      try {
        // Delete from Supabase
        const { error } = await facilitiesApi.delete(facilityId);
        
        if (error) {
          console.error('Error deleting facility:', error);
          alert('Failed to delete facility. Please try again.');
          return;
        }

        // Update local state
        setFacilities(prev => prev.filter(f => f.id !== facilityId));
        
        // Recalculate stats
        const updatedFacilities = facilities.filter(f => f.id !== facilityId);
        const totalBookings = updatedFacilities.reduce((sum: number, facility: any) => sum + 0, 0); // Will be updated when bookings are implemented
        const monthlyRevenue = updatedFacilities.reduce((sum: number, facility: any) => sum + 0, 0); // Will be updated when pricing are implemented
        
        setStats({
          totalProperties: updatedFacilities.length,
          activeProperties: updatedFacilities.filter((f: any) => f.status === 'active').length,
          totalBookings,
          monthlyRevenue
        });
      } catch (err) {
        console.error('Error deleting facility:', err);
        alert('Failed to delete facility. Please try again.');
      }
    }
  };

  const refreshFacilities = async () => {
    if (!user?.id) return;
    
    try {
      setError(null); // Clear any previous errors
      setLoading(true);
      
      // Fetch facilities from Supabase
      console.log('Refreshing facilities for user:', user.id);
      
      // First try to get facilities by owner, if that fails, get all and filter
      let { data, error } = await facilitiesApi.getByOwner(user.id);
      
      // If getByOwner fails, fallback to getAll and filter
      if (error || !data) {
        console.log('getByOwner failed, trying getAll with filter...');
        const { data: allData, error: allError } = await facilitiesApi.getAll();
        
        if (allError) {
          console.error('Error fetching all facilities:', allError);
          setLoading(false);
          return;
        }
        
        // Filter facilities by owner_id
        data = allData?.filter((facility: any) => facility.owner_id === user.id) || [];
        console.log('Filtered facilities by owner:', data);
      }
      
      console.log('Refreshed facilities response:', { data, error });
      
      if (error && !data) {
        console.error('Error refreshing facilities:', error);
        setLoading(false);
        return;
      }

      console.log('Refreshed facilities data:', data);
      
      setFacilities(data || []);
      
      // Calculate stats
      const totalBookings = (data || []).reduce((sum: number, facility: any) => sum + 0, 0); // Will be updated when bookings are implemented
      const monthlyRevenue = (data || []).reduce((sum: number, facility: any) => sum + 0, 0); // Will be updated when pricing is implemented
      
      setStats({
        totalProperties: (data || []).length,
        activeProperties: (data || []).filter((f: any) => f.status === 'active').length,
        totalBookings,
        monthlyRevenue
      });
    } catch (err) {
      console.error('Error refreshing facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFacilityTypeLabel = (type: FacilityType) => {
    const labels: { [key in FacilityType]: string } = {
      'basketball_court': 'Basketball Court',
      'tennis_court': 'Tennis Court',
      'volleyball_court': 'Volleyball Court',
      'badminton_court': 'Badminton Court',
      'soccer_field': 'Soccer Field',
      'baseball_field': 'Baseball Field',
      'swimming_pool': 'Swimming Pool',
      'gym': 'Gym',
      'multi_sport': 'Multi-Sport Facility',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your facilities...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment after posting a new facility</p>
          <button
            onClick={() => {
              console.log('Manual refresh triggered');
              setLoading(false);
              setError('Manual refresh - please try again');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Stop Loading
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Facilities</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                refreshFacilities();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/owner/post-property')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Post New Facility
            </button>
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Facility Owner Dashboard</h1>
              <p className="text-gray-600">Manage your sports facilities and track performance</p>
            </div>
            <Link
              to="/owner/post-property"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post Facility
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info & Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user?.fullName || 'Facility Owner'}!</h2>
              <p className="text-gray-600">Here's an overview of your sports facilities</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshFacilities}
                disabled={loading}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={async () => {
                  console.log('Testing connection to facilities table...');
                  const { data, error } = await facilitiesApi.getAll();
                  console.log('Test connection result:', { data, error });
                  if (error) {
                    alert(`Connection error: ${error.message}`);
                  } else {
                    alert(`Connection successful! Found ${data?.length || 0} facilities`);
                  }
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Test DB Connection
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-xs font-mono text-gray-400">{user?.id}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalProperties}</div>
              <div className="text-sm text-gray-600">Total Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.activeProperties}</div>
              <div className="text-sm text-gray-600">Active Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">${stats.monthlyRevenue}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
          </div>
        </div>

        {/* Venue Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {facilities.filter(f => f.status === 'active').length}
              </div>
              <div className="text-sm font-medium text-green-800">Active Facilities</div>
              <div className="text-xs text-green-600 mt-1">Available for booking</div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {facilities.filter(f => f.status === 'maintenance').length}
              </div>
              <div className="text-sm font-medium text-yellow-800">Under Maintenance</div>
              <div className="text-xs text-yellow-600 mt-1">Temporarily unavailable</div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {facilities.filter(f => f.status === 'inactive').length}
              </div>
              <div className="text-sm font-medium text-red-800">Inactive Facilities</div>
              <div className="text-xs text-red-600 mt-1">Not available for booking</div>
            </div>
          </div>
        </div>

        {/* Venue Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {facilities.length}
              </div>
              <div className="text-sm font-medium text-blue-800">Total Facilities</div>
              <div className="text-xs text-blue-600 mt-1">All facilities combined</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {facilities.filter(f => f.is_verified).length}
              </div>
              <div className="text-sm font-medium text-purple-800">Verified Facilities</div>
              <div className="text-xs text-purple-600 mt-1">Trusted by users</div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {facilities.filter(f => f.status === 'active').length}
              </div>
              <div className="text-sm font-medium text-indigo-800">Bookable Facilities</div>
              <div className="text-xs text-indigo-600 mt-1">Ready for customers</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {facilities.filter(f => f.featured).length}
              </div>
              <div className="text-sm font-medium text-orange-800">Featured Facilities</div>
              <div className="text-xs text-orange-600 mt-1">Premium listings</div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Facilities</h2>
                <p className="text-sm text-gray-600">Manage and monitor your sports facilities</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Showing {facilities.length} facilit{facilities.length !== 1 ? 'ies' : 'y'}</div>
                <div className="text-xs text-gray-400">
                  {facilities.filter(f => f.status === 'active').length} active • 
                  {facilities.filter(f => f.status === 'maintenance').length} maintenance • 
                  {facilities.filter(f => f.status === 'inactive').length} inactive
                </div>
              </div>
            </div>
          </div>

          {facilities.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first sports facility</p>
              <Link
                to="/owner/post-property"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post Your First Facility
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {facilities.map((facility) => (
                <div key={facility.id} className="px-6 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(facility.status)}`}>
                          {facility.status}
                        </span>
                        {facility.is_verified && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            VERIFIED
                          </span>
                        )}
                        {facility.featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            FEATURED
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{facility.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {facility.address}, {facility.city}, {facility.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Trophy className="h-4 w-4 mr-2" />
                          {getFacilityTypeLabel(facility.facility_type)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Created {new Date(facility.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Owner: {facility.owner_id}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {facility.contact_phone && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {facility.contact_phone}
                          </div>
                        )}
                        {facility.contact_email && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {facility.contact_email}
                          </div>
                        )}
                      </div>

                      {/* Facility Details */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {getFacilityTypeLabel(facility.facility_type)}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {facility.status}
                          </div>
                          <div>
                            <span className="font-medium">Verified:</span> {facility.is_verified ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <span className="font-medium">Featured:</span> {facility.featured ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/owner/facility/${facility.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/owner/edit-facility/${facility.id}`)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Facility"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFacility(facility.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Facility"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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
