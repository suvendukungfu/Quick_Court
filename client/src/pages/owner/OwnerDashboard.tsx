import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { properties } from '../../lib/supabase';
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

interface Property {
  id: string;
  owner_id: string;
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
  totalBookings: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalBookings: 0,
    monthlyRevenue: 0
  });

  // Redirect if not a facility owner
  if (user?.role !== 'facility_owner') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch real properties from Supabase
        console.log('Loading properties for user:', user.id);
        const { data, error } = await properties.getByOwner(user.id);
        
        console.log('Properties response:', { data, error });
        
        if (error) {
          console.error('Error fetching properties:', error);
          return;
        }

        // Transform Supabase data to match our interface
        console.log('Raw properties data:', data);
        
        const transformedProperties: Property[] = (data || []).map(prop => ({
          id: prop.id,
          owner_id: prop.owner_id,
          property_name: prop.property_name,
          property_type: prop.property_type,
          address: prop.address,
          current_status: prop.current_status,
          is_sold: prop.is_sold,
          current_booking_start: prop.current_booking_start,
          current_booking_end: prop.current_booking_end,
          next_available_time: prop.next_available_time,
          total_booked_hours: prop.total_booked_hours || 0,
          monthly_booked_hours: prop.monthly_booked_hours || 0,
          description: prop.description || `A ${prop.property_type?.replace('_', ' ')} facility`, // Generate description
          sports: [prop.property_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Sports'], // Generate from property_type
          amenities: ['Basic Amenities'], // Default amenities
          pricePerHour: 25, // Default price since price_per_hour doesn't exist
          operatingHours: { start: '09:00', end: '18:00' }, // Default operating hours
          totalBookings: prop.total_booked_hours || 0,
          monthlyRevenue: 25 * (prop.monthly_booked_hours || 0), // Calculate with default price
          rating: 4.5, // Default rating
          reviewCount: 0, // Default review count
          createdAt: new Date().toISOString() // Default creation date
        }));
        
        console.log('Transformed properties:', transformedProperties);

        setProperties(transformedProperties);
        
        // Calculate stats
        const totalBookings = transformedProperties.reduce((sum, prop) => sum + prop.totalBookings, 0);
        const monthlyRevenue = transformedProperties.reduce((sum, prop) => sum + prop.monthlyRevenue, 0);
        
        setStats({
          totalProperties: transformedProperties.length,
          activeProperties: transformedProperties.filter(p => p.current_status === 'active').length,
          totalBookings,
          monthlyRevenue
        });
      } catch (err) {
        console.error('Error loading properties:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [user?.id]);

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        // Delete from Supabase
        const { error } = await properties.delete(propertyId);
        
        if (error) {
          console.error('Error deleting property:', error);
          alert('Failed to delete property. Please try again.');
          return;
        }

        // Update local state
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        
        // Recalculate stats
        const updatedProperties = properties.filter(p => p.id !== propertyId);
        const totalBookings = updatedProperties.reduce((sum, prop) => sum + prop.totalBookings, 0);
        const monthlyRevenue = updatedProperties.reduce((sum, prop) => sum + prop.monthlyRevenue, 0);
        
        setStats({
          totalProperties: updatedProperties.length,
          activeProperties: updatedProperties.filter(p => p.current_status === 'active').length,
          totalBookings,
          monthlyRevenue
        });
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'sports_complex': 'Sports Complex',
      'basketball_court': 'Basketball Court',
      'tennis_court': 'Tennis Court',
      'swimming_pool': 'Swimming Pool',
      'fitness_center': 'Fitness Center',
      'football_field': 'Football Field',
      'cricket_ground': 'Cricket Ground',
      'badminton_court': 'Badminton Court',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              Post Property
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
                onClick={async () => {
                  console.log('Testing connection to facility_availability table...');
                  const { data, error } = await properties.testConnection();
                  console.log('Test connection result:', { data, error });
                  if (error) {
                    alert(`Connection error: ${error.message}`);
                  } else {
                    alert(`Connection successful! Found ${data?.length || 0} records`);
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
                {properties.filter(p => p.current_status === 'active').length}
              </div>
              <div className="text-sm font-medium text-green-800">Active Venues</div>
              <div className="text-xs text-green-600 mt-1">Available for booking</div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {properties.filter(p => p.current_status === 'maintenance').length}
              </div>
              <div className="text-sm font-medium text-yellow-800">Under Maintenance</div>
              <div className="text-xs text-yellow-600 mt-1">Temporarily unavailable</div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {properties.filter(p => p.is_sold).length}
              </div>
              <div className="text-sm font-medium text-red-800">Sold Venues</div>
              <div className="text-xs text-red-600 mt-1">No longer available</div>
            </div>
          </div>
        </div>

        {/* Venue Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {properties.reduce((sum, p) => sum + (p.total_booked_hours || 0), 0).toFixed(1)}
              </div>
              <div className="text-sm font-medium text-blue-800">Total Hours</div>
              <div className="text-xs text-blue-600 mt-1">All venues combined</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {properties.reduce((sum, p) => sum + (p.monthly_booked_hours || 0), 0).toFixed(1)}
              </div>
              <div className="text-sm font-medium text-purple-800">Monthly Hours</div>
              <div className="text-xs text-purple-600 mt-1">This month</div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {properties.filter(p => p.current_status === 'active' && !p.is_sold).length}
              </div>
              <div className="text-sm font-medium text-indigo-800">Bookable Venues</div>
              <div className="text-xs text-indigo-600 mt-1">Ready for customers</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${(properties.reduce((sum, p) => sum + (p.monthly_booked_hours || 0), 0) * 25).toFixed(0)}
              </div>
              <div className="text-sm font-medium text-orange-800">Est. Monthly Revenue</div>
              <div className="text-xs text-orange-600 mt-1">Based on $25/hour rate</div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
                <p className="text-sm text-gray-600">Manage and monitor your sports facilities</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Showing {properties.length} venue{properties.length !== 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-400">
                  {properties.filter(p => p.current_status === 'active').length} active • 
                  {properties.filter(p => p.current_status === 'maintenance').length} maintenance • 
                  {properties.filter(p => p.is_sold).length} sold
                </div>
              </div>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first sports facility</p>
              <Link
                to="/owner/post-property"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post Your First Property
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {properties.map((property) => (
                <div key={property.id} className="px-6 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                                             <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-lg font-semibold text-gray-900">{property.property_name}</h3>
                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.current_status)}`}>
                           {property.current_status}
                         </span>
                         {property.is_sold && (
                           <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                             SOLD
                           </span>
                         )}
                       </div>
                      
                      <p className="text-gray-600 mb-3">{property.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {property.address}
                        </div>
                                                 <div className="flex items-center text-sm text-gray-600">
                           <Trophy className="h-4 w-4 mr-2" />
                           {getPropertyTypeLabel(property.property_type)}
                         </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          ${property.pricePerHour}/hour
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {property.operatingHours.start} - {property.operatingHours.end}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.sports.map((sport, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {sport}
                          </span>
                        ))}
                      </div>

                                             <div className="flex items-center gap-6 text-sm text-gray-600">
                         <div className="flex items-center">
                           <Star className="h-4 w-4 mr-1 text-yellow-500" />
                           {property.rating} ({property.reviewCount} reviews)
                         </div>
                         <div className="flex items-center">
                           <Calendar className="h-4 w-1" />
                           {property.totalBookings} bookings
                         </div>
                         <div className="flex items-center">
                           <DollarSign className="h-4 w-4 mr-1" />
                           ${property.monthlyRevenue}/month
                         </div>
                       </div>

                       {/* Additional Database Fields */}
                       <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                           <div>
                             <span className="font-medium">Total Hours:</span> {property.total_booked_hours}h
                           </div>
                           <div>
                             <span className="font-medium">Monthly Hours:</span> {property.monthly_booked_hours}h
                           </div>
                           {property.current_booking_start && (
                             <div>
                               <span className="font-medium">Booked Until:</span> {new Date(property.current_booking_end).toLocaleDateString()}
                             </div>
                           )}
                           {property.next_available_time && (
                             <div>
                               <span className="font-medium">Available From:</span> {new Date(property.next_available_time).toLocaleDateString()}
                             </div>
                           )}
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/owner/property/${property.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/owner/edit-property/${property.id}`)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Property"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Property"
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
