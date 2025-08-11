import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Trophy, Filter, Search, ArrowRight } from 'lucide-react';
import { facilities } from '../../lib/supabase';
import { Facility, FacilityType } from '../../types/facility';

export default function VenuesPage() {
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FacilityType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');

  // Fetch all facilities from Supabase
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        console.log('Loading all facilities from Supabase...');
        const { data, error } = await facilities.getAll();
        
        if (error) {
          console.error('Error fetching facilities:', error);
          return;
        }

        console.log('Facilities loaded:', data);
        setAllFacilities(data || []);
        setFilteredFacilities(data || []);
      } catch (err) {
        console.error('Error fetching facilities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Filter facilities based on search and filters
  useEffect(() => {
    let filtered = allFacilities;

    // Always exclude banned facilities from user view
    filtered = filtered.filter(facility => facility.status !== 'banned');

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by facility type
    if (selectedType !== 'all') {
      filtered = filtered.filter(facility => facility.facility_type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(facility => facility.status === selectedStatus);
    }

    setFilteredFacilities(filtered);
  }, [allFacilities, searchTerm, selectedType, selectedStatus]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900">Sports Facilities</h1>
            <p className="text-gray-600 mt-2">Discover and book amazing sports facilities near you</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities, cities, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Facility Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as FacilityType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="basketball_court">Basketball Court</option>
                <option value="tennis_court">Tennis Court</option>
                <option value="volleyball_court">Volleyball Court</option>
                <option value="badminton_court">Badminton Court</option>
                <option value="soccer_field">Soccer Field</option>
                <option value="baseball_field">Baseball Field</option>
                <option value="swimming_pool">Swimming Pool</option>
                <option value="gym">Gym</option>
                <option value="multi_sport">Multi-Sport</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'maintenance' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredFacilities.length} of {allFacilities.length} facilities
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Facilities Grid */}
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No facilities have been posted yet. Check back later!'}
            </p>
            {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((facility) => (
              <div
                key={facility.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-600 font-semibold">{getFacilityTypeLabel(facility.facility_type)}</p>
                  </div>
                  {facility.is_verified && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        VERIFIED
                      </span>
                    </div>
                  )}
                  {facility.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        FEATURED
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{facility.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold ml-1">4.5</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{facility.description}</p>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{facility.city}, {facility.state}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                      {getFacilityTypeLabel(facility.facility_type)}
                    </span>
                    {facility.is_verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                        Verified
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(facility.status)}`}>
                      {facility.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">$25</span>
                      <span className="text-gray-600 text-sm">/hour</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(facility.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Link
                    to={`/book-facility/${facility.id}`}
                    className={`w-full py-2 px-4 rounded-lg text-center transition-colors block ${
                      facility.status === 'active'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (facility.status !== 'active') {
                        e.preventDefault();
                      }
                    }}
                  >
                    {facility.status === 'active' ? 'Book Now' : 'Not Available'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}