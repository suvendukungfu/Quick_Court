import React, { useState, useEffect } from 'react';
import { User, Building, DollarSign, Calendar, Star, Edit2, Camera, TrendingUp, Users, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { facilities as facilitiesApi } from '../../lib/supabase';
import { Facility } from '../../types/facility';

interface OwnerStats {
  totalFacilities: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  activeCourts: number;
}

interface OwnerProfile {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  businessName?: string;
  businessAddress?: string;
  phone?: string;
  address?: string;
  bio?: string;
  joinDate: string;
  stats: OwnerStats;
  facilities: Facility[];
}

const OwnerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<OwnerProfile>({
    id: user?.id || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&size=150`,
    role: user?.role || 'facility_owner',
    businessName: user?.businessName || '',
    businessAddress: user?.businessAddress || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: 'Professional facility owner committed to providing premium sports facilities and exceptional customer service.',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Recently',
    stats: {
      totalFacilities: 0,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      activeCourts: 0
    },
    facilities: []
  });

  // Fetch user's facilities and calculate stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch facilities for this user
        let { data: facilitiesData, error } = await facilitiesApi.getByOwner(user.id);
        
        // If getByOwner fails, fallback to getAll and filter
        if (error || !facilitiesData) {
          const { data: allData, error: allError } = await facilitiesApi.getAll();
          
          if (allError) {
            console.error('Error fetching facilities:', allError);
            return;
          }
          
          // Filter facilities by owner_id
          facilitiesData = allData?.filter((facility: any) => facility.owner_id === user.id) || [];
        }
        
        // Calculate stats based on real data
        const totalFacilities = facilitiesData?.length || 0;
        const activeCourts = facilitiesData?.filter((f: any) => f.status === 'active').length || 0;
        const totalBookings = 0; // Will be implemented when bookings are added
        const totalRevenue = 0; // Will be implemented when pricing is added
        const averageRating = 4.5; // Default rating for now
        
        setProfile(prev => ({
          ...prev,
          id: user.id,
          fullName: user.fullName || '',
          email: user.email || '',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || 'User'}&size=150`,
          role: user.role || 'facility_owner',
          businessName: user.businessName || '',
          businessAddress: user.businessAddress || '',
          phone: user.phone || '',
          address: user.address || '',
          joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }) : 'Recently',
          stats: {
            totalFacilities,
            totalBookings,
            totalRevenue,
            averageRating,
            activeCourts
          },
          facilities: facilitiesData || []
        }));
        
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically make an API call to save the profile
    // For now, we'll just update the local state
    console.log('Profile updated:', profile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Facility Owner Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName}&size=150`}
                    alt={profile.fullName}
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.fullName
                  )}
                </h2>
                
                <p className="text-gray-600 mt-1">{profile.email}</p>
                
                <div className="mt-4 text-sm text-gray-500">
                  <Building className="w-4 h-4 inline mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.businessName || ''}
                      onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="Enter business name"
                    />
                  ) : (
                    profile.businessName || 'No business name set'
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.businessAddress || ''}
                      onChange={(e) => setProfile({...profile, businessAddress: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="Enter business address"
                    />
                  ) : (
                    profile.businessAddress || 'No business address set'
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    profile.phone || 'No phone number set'
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {profile.email}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Owner since {profile.joinDate}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
                {isEditing ? (
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500"
                    rows={3}
                    placeholder="Tell us about yourself and your business..."
                  />
                ) : (
                  <p className="text-sm text-gray-600">{profile.bio || 'No bio added yet. Click edit to add your bio.'}</p>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Facilities</span>
                  <span className="text-lg font-semibold text-blue-600">{profile.stats.totalFacilities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Courts</span>
                  <span className="text-lg font-semibold text-green-600">{profile.stats.activeCourts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-lg font-semibold text-purple-600">{profile.stats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-lg font-semibold text-green-600">${profile.stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="text-lg font-semibold text-yellow-600">{profile.stats.averageRating}/5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Facilities & Recent Bookings */}
          <div className="lg:col-span-2">
            {/* Facilities Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-500" />
                My Facilities ({profile.facilities.length})
              </h3>
              {profile.facilities.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No facilities yet</h4>
                  <p className="text-gray-600 mb-4">Start by posting your first sports facility</p>
                  <a
                    href="/owner/post-property"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Post Facility
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.facilities.map((facility) => (
                    <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {facility.facility_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">4.5</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {facility.city}, {facility.state}
                        </p>
                        <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          facility.status === 'active' ? 'bg-green-100 text-green-800' :
                          facility.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {facility.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Profile Summary
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">User ID:</span> <span className="font-mono text-gray-600">{profile.id}</span></p>
                      <p><span className="font-medium">Role:</span> <span className="text-blue-600 capitalize">{profile.role.replace('_', ' ')}</span></p>
                      <p><span className="font-medium">Member Since:</span> <span className="text-gray-600">{profile.joinDate}</span></p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Business Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Business Name:</span> <span className="text-gray-600">{profile.businessName || 'Not set'}</span></p>
                      <p><span className="font-medium">Phone:</span> <span className="text-gray-600">{profile.phone || 'Not set'}</span></p>
                      <p><span className="font-medium">Address:</span> <span className="text-gray-600">{profile.address || 'Not set'}</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/owner/post-property"
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Building className="w-3 h-3 mr-1" />
                      Post New Facility
                    </a>
                    <a
                      href="/owner/dashboard"
                      className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      View Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfilePage;
