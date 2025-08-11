import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, X, Eye, MapPin, Clock, Star, Calendar, Building } from 'lucide-react';
import { facilities as facilitiesApi, users as usersApi } from '../../lib/supabase';
import { Facility as RealFacility } from '../../types/facility';
import { User } from '../../types';

interface AdminFacility extends RealFacility {
  ownerName?: string;
  ownerEmail?: string;
  rating?: number;
  reviewCount?: number;
}

export default function AdminFacilities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const [facilities, setFacilities] = useState<AdminFacility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchFacilitiesAndUsers = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch facilities and users...');
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log('Loading timeout reached, stopping loading state');
          setLoading(false);
        }, 10000); // 10 second timeout
        
        // Fetch facilities and users
        const [facilitiesResponse, usersResponse] = await Promise.all([
          facilitiesApi.getAll(),
          usersApi.getAll()
        ]);
        
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        console.log('API responses received:', { facilitiesResponse, usersResponse });
        
        if (facilitiesResponse.error) {
          console.error('Error fetching facilities:', facilitiesResponse.error);
        }
        
        if (usersResponse.error) {
          console.error('Error fetching users:', usersResponse.error);
        }
        
        // Use fallback data if API calls fail
        let facilitiesData = facilitiesResponse.data || [];
        let usersData = usersResponse.data || [];
        
        // If both API calls failed, set empty arrays and stop loading
        if (facilitiesResponse.error && usersResponse.error) {
          console.log('Both API calls failed, setting empty data');
          setFacilities([]);
          setUsers([]);
          setLoading(false);
          return;
        }
        
        console.log('Data extracted:', { facilitiesData, usersData });
        
        // Map facilities with owner information
        const facilitiesWithOwners: AdminFacility[] = facilitiesData.map((facility: any) => {
          const owner = usersData.find((user: User) => user.id === facility.owner_id);
          return {
            ...facility,
            ownerName: owner?.fullName || 'Unknown Owner',
            ownerEmail: owner?.email || 'No email',
            rating: 4.5, // Default rating for now
            reviewCount: 0 // Will be implemented when reviews are added
          };
        });
        
        console.log('Facilities with owners mapped:', facilitiesWithOwners);
        
        setFacilities(facilitiesWithOwners);
        setUsers(usersData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        // Set loading to false even on error
        setLoading(false);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };
    
    fetchFacilitiesAndUsers();
  }, []);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (facility.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'banned': return 'bg-red-100 text-red-800 border-2 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (facilityId: string) => {
    console.log('Approving facility:', facilityId);
    // Here you would make an API call to approve the facility
  };

  const handleReject = (facilityId: string) => {
    console.log('Rejecting facility:', facilityId);
    // Here you would make an API call to reject the facility
  };

  const handleBan = (facilityId: string) => {
    console.log('Banning facility:', facilityId);
    // Here you would make an API call to ban the facility
    // Update local state to reflect the ban
    setFacilities(prev => prev.map(f => 
      f.id === facilityId ? { ...f, status: 'banned' } : f
    ));
  };

  const handleUnban = (facilityId: string) => {
    console.log('Unbanning facility:', facilityId);
    // Here you would make an API call to unban the facility
    // Update local state to reflect the unban
    setFacilities(prev => prev.map(f => 
      f.id === facilityId ? { ...f, status: 'active' } : f
    ));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-600 mt-2">Review and approve facility submissions</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
        <p className="text-gray-600 mt-2">Review and approve facility submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Facilities</p>
              <p className="text-2xl font-bold text-gray-900">{facilities.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {facilities.filter(f => f.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {facilities.filter(f => f.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {facilities.filter(f => f.status === 'inactive').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Banned</p>
              <p className="text-2xl font-bold text-gray-900">
                {facilities.filter(f => f.status === 'banned').length}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <X className="h-6 w-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search facilities by name, owner, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="closed">Closed</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Facilities List */}
      <div className="space-y-6">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{facility.name}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(facility.status)}`}>
                          {facility.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Owner:</strong> {facility.ownerName} ({facility.ownerEmail})</p>
                        <p><strong>Location:</strong> {facility.address}, {facility.city}, {facility.state}</p>
                        <p><strong>Type:</strong> {facility.facility_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                        <p><strong>Created:</strong> {new Date(facility.created_at).toLocaleDateString()}</p>
                        <p><strong>Verified:</strong> {facility.is_verified ? 'Yes' : 'No'}</p>
                        {facility.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{facility.rating} ({facility.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedFacility(facility)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  
                  {facility.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(facility.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(facility.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  {facility.status !== 'banned' && facility.status !== 'pending' && (
                    <button
                      onClick={() => handleBan(facility.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Ban this facility"
                    >
                      Ban
                    </button>
                  )}
                  
                  {facility.status === 'banned' && (
                    <button
                      onClick={() => handleUnban(facility.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Unban this facility"
                    >
                      Unban
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedFacility.name}</h2>
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="w-full h-64 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Building className="h-24 w-24 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Owner:</strong> {selectedFacility.ownerName}</div>
                  <div><strong>Email:</strong> {selectedFacility.ownerEmail}</div>
                  <div><strong>Location:</strong> {selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state}</div>
                  <div><strong>Type:</strong> {selectedFacility.facility_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                  <div><strong>Created:</strong> {new Date(selectedFacility.created_at).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedFacility.status)}`}>
                      {selectedFacility.status}
                    </span>
                  </div>
                </div>
                
                {selectedFacility.status === 'pending' && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleApprove(selectedFacility.id);
                        setSelectedFacility(null);
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve Facility</span>
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedFacility.id);
                        setSelectedFacility(null);
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-5 w-5" />
                      <span>Reject Facility</span>
                    </button>
                  </div>
                )}
                
                {selectedFacility.status !== 'banned' && selectedFacility.status !== 'pending' && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleBan(selectedFacility.id);
                        setSelectedFacility(null);
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-5 w-5" />
                      <span>Ban Facility</span>
                    </button>
                  </div>
                )}
                
                {selectedFacility.status === 'banned' && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleUnban(selectedFacility.id);
                        setSelectedFacility(null);
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Unban Facility</span>
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