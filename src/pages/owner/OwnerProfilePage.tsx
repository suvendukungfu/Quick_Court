import React, { useState } from 'react';
import { User, Building, DollarSign, Calendar, Star, Edit2, Camera, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  businessName: string;
  businessAddress: string;
  phone: string;
  bio: string;
  joinDate: string;
  stats: OwnerStats;
  facilities: {
    id: string;
    name: string;
    sport: string;
    rating: number;
    bookings: number;
    revenue: number;
  }[];
  recentBookings: {
    id: string;
    date: string;
    facility: string;
    court: string;
    amount: number;
    status: string;
  }[];
}

const OwnerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<OwnerProfile>({
    id: '2',
    fullName: 'Sarah Williams',
    email: 'sarah.williams@elitecomplex.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'facility_owner',
    businessName: 'Elite Sports Complex',
    businessAddress: '123 Sports Avenue, Downtown City',
    phone: '+1 (555) 123-4567',
    bio: 'Professional facility owner with 8+ years of experience in sports management. Committed to providing premium sports facilities and exceptional customer service.',
    joinDate: 'March 2020',
    stats: {
      totalFacilities: 3,
      totalBookings: 1247,
      totalRevenue: 45680,
      averageRating: 4.7,
      activeCourts: 12
    },
    facilities: [
      {
        id: '1',
        name: 'Elite Sports Complex',
        sport: 'Multi-sport',
        rating: 4.8,
        bookings: 856,
        revenue: 32150
      },
      {
        id: '2',
        name: 'City Badminton Center',
        sport: 'Badminton',
        rating: 4.6,
        bookings: 391,
        revenue: 13530
      }
    ],
    recentBookings: [
      {
        id: '1',
        date: '2 hours ago',
        facility: 'Elite Sports Complex',
        court: 'Badminton Court 1',
        amount: 25,
        status: 'confirmed'
      },
      {
        id: '2',
        date: '5 hours ago',
        facility: 'City Badminton Center',
        court: 'Court A',
        amount: 20,
        status: 'confirmed'
      },
      {
        id: '3',
        date: '1 day ago',
        facility: 'Elite Sports Complex',
        court: 'Tennis Court 1',
        amount: 45,
        status: 'completed'
      }
    ]
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically make an API call to save the profile
  };

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
                      value={profile.businessName}
                      onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.businessName
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.businessAddress}
                      onChange={(e) => setProfile({...profile, businessAddress: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.businessAddress
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.phone
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Owner since {profile.joinDate}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{profile.bio}</p>
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
                My Facilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.facilities.map((facility) => (
                  <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{facility.sport}</p>
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{facility.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{facility.bookings} bookings</p>
                      <p className="font-semibold text-green-600">${facility.revenue.toLocaleString()} revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                Recent Bookings
              </h3>
              <div className="space-y-4">
                {profile.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{booking.facility}</p>
                      <p className="text-sm text-gray-600">{booking.court}</p>
                      <p className="text-xs text-gray-400">{booking.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${booking.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
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
