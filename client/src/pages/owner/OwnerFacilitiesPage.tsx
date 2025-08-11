import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facilities as facilitiesApi } from '../../lib/supabase';
import { 
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
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Phone,
  Mail,
  Globe,
  Settings
} from 'lucide-react';
import { Facility, FacilityType, FacilityStatus } from '../../types/facility';

export default function OwnerFacilitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FacilityType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        
      } catch (err) {
        console.error('Error loading facilities:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [user?.id]);

  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await facilitiesApi.delete(facilityId);
      if (error) {
        console.error('Error deleting facility:', error);
        alert(`Failed to delete facility: ${error.message}`);
        return;
      }

      // Remove from local state
      setFacilities(prev => prev.filter(f => f.id !== facilityId));
      alert('Facility deleted successfully');
    } catch (err) {
      console.error('Error deleting facility:', err);
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const refreshFacilities = async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await facilitiesApi.getByOwner(user.id);
      
      if (error) {
        console.error('Error refreshing facilities:', error);
        setError(`Failed to refresh facilities: ${error.message}`);
        return;
      }
      
      setFacilities(data || []);
    } catch (err) {
      console.error('Error refreshing facilities:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: FacilityStatus) => {
    const statusColors: Record<FacilityStatus, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      banned: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: FacilityStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4" />;
      case 'closed':
      case 'banned':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Filter facilities based on search and filters
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || facility.status === statusFilter;
    const matchesType = typeFilter === 'all' || facility.facility_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: facilities.length,
    active: facilities.filter(f => f.status === 'active').length,
    inactive: facilities.filter(f => f.status === 'inactive').length,
    maintenance: facilities.filter(f => f.status === 'maintenance').length,
    verified: facilities.filter(f => f.is_verified).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your facilities...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Facilities</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshFacilities}
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
              <h1 className="text-3xl font-bold text-gray-900">My Facilities</h1>
              <p className="text-gray-600 mt-1">Manage all your sports facilities and properties</p>
            </div>
            <Link
              to="/owner/post-facility"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Facility
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FacilityStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="closed">Closed</option>
                <option value="banned">Banned</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FacilityType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="basketball_court">Basketball Court</option>
                <option value="tennis_court">Tennis Court</option>
                <option value="football_field">Football Field</option>
                <option value="cricket_ground">Cricket Ground</option>
                <option value="badminton_court">Badminton Court</option>
                <option value="volleyball_court">Volleyball Court</option>
                <option value="swimming_pool">Swimming Pool</option>
                <option value="gym">Gym</option>
                <option value="yoga_studio">Yoga Studio</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Facilities List */}
        {filteredFacilities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {facilities.length === 0 ? 'No facilities yet' : 'No facilities match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {facilities.length === 0 
                ? 'Get started by adding your first sports facility to start earning revenue.'
                : 'Try adjusting your search terms or filters to see more results.'
              }
            </p>
            {facilities.length === 0 && (
              <Link
                to="/owner/post-facility"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Facility
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredFacilities.map((facility) => (
              <div key={facility.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{facility.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{getFacilityTypeLabel(facility.facility_type)}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                            {getStatusIcon(facility.status)}
                            {facility.status}
                          </span>
                          {facility.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {facility.description || 'No description available'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{facility.city}, {facility.state}</span>
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
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Created {new Date(facility.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/facility/${facility.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/owner/edit-facility/${facility.id}`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Facility"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFacility(facility.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Facility"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                              {getStatusIcon(facility.status)}
                              {facility.status}
                            </span>
                            {facility.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Star className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{getFacilityTypeLabel(facility.facility_type)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{facility.city}, {facility.state}</span>
                            </div>
                            {facility.contact_phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                <span>{facility.contact_phone}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Created {new Date(facility.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/facility/${facility.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/owner/edit-facility/${facility.id}`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Facility"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFacility(facility.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Facility"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
