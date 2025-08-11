import React, { useState } from 'react';
import { Search, Filter, CheckCircle, X, Eye, MapPin, Clock, Star, Calendar } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  address: string;
  sports: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitDate: string;
  rating?: number;
  reviewCount?: number;
  priceRange: { min: number; max: number };
  photos: string[];
}

export default function AdminFacilities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const mockFacilities: Facility[] = [
    {
      id: '1',
      name: 'Elite Sports Complex',
      ownerName: 'Sarah Williams',
      ownerEmail: 'sarah.williams@elitecomplex.com',
      address: '123 Sports Avenue, Downtown City',
      sports: ['Badminton', 'Tennis', 'Basketball'],
      status: 'approved',
      submitDate: '2024-01-10',
      rating: 4.8,
      reviewCount: 124,
      priceRange: { min: 25, max: 60 },
      photos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop']
    },
    {
      id: '2',
      name: 'Green Valley Sports Center',
      ownerName: 'Mike Johnson',
      ownerEmail: 'mike@greenvalley.com',
      address: '456 Valley Road, Suburbs',
      sports: ['Football', 'Cricket'],
      status: 'pending',
      submitDate: '2024-01-12',
      priceRange: { min: 30, max: 45 },
      photos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop']
    },
    {
      id: '3',
      name: 'Urban Basketball Courts',
      ownerName: 'Alex Chen',
      ownerEmail: 'alex@urbanbasket.com',
      address: '789 Urban Street, City Center',
      sports: ['Basketball'],
      status: 'pending',
      submitDate: '2024-01-15',
      priceRange: { min: 20, max: 35 },
      photos: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop']
    },
    {
      id: '4',
      name: 'Rejected Tennis Club',
      ownerName: 'Tom Wilson',
      ownerEmail: 'tom@rejectedclub.com',
      address: '321 Failed Street, Nowhere',
      sports: ['Tennis'],
      status: 'rejected',
      submitDate: '2024-01-08',
      priceRange: { min: 40, max: 80 },
      photos: ['https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=300&h=200&fit=crop']
    }
  ];

  const filteredFacilities = mockFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
              <p className="text-2xl font-bold text-gray-900">{mockFacilities.length}</p>
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
                {mockFacilities.filter(f => f.status === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockFacilities.filter(f => f.status === 'approved').length}
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
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockFacilities.filter(f => f.status === 'rejected').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <X className="h-6 w-6 text-red-600" />
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
                    <img
                      src={facility.photos[0]}
                      alt={facility.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{facility.name}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(facility.status)}`}>
                          {facility.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Owner:</strong> {facility.ownerName} ({facility.ownerEmail})</p>
                        <p><strong>Location:</strong> {facility.address}</p>
                        <p><strong>Sports:</strong> {facility.sports.join(', ')}</p>
                        <p><strong>Price Range:</strong> ${facility.priceRange.min} - ${facility.priceRange.max}/hour</p>
                        <p><strong>Submitted:</strong> {new Date(facility.submitDate).toLocaleDateString()}</p>
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
                <img
                  src={selectedFacility.photos[0]}
                  alt={selectedFacility.name}
                  className="w-full h-64 rounded-lg object-cover"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Owner:</strong> {selectedFacility.ownerName}</div>
                  <div><strong>Email:</strong> {selectedFacility.ownerEmail}</div>
                  <div><strong>Location:</strong> {selectedFacility.address}</div>
                  <div><strong>Sports:</strong> {selectedFacility.sports.join(', ')}</div>
                  <div><strong>Price Range:</strong> ${selectedFacility.priceRange.min} - ${selectedFacility.priceRange.max}/hour</div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}