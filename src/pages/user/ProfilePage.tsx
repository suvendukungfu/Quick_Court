import React, { useState } from 'react';
import { User, Calendar, Trophy, MapPin, Clock, Star, Edit2, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PlayerStats {
  totalGames: number;
  winRate: number;
  favoriteSport: string;
  skillLevel: string;
  totalHours: number;
}

interface PlayerProfile {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  location: string;
  bio: string;
  joinDate: string;
  stats: PlayerStats;
  achievements: string[];
  recentActivity: {
    date: string;
    activity: string;
    facility: string;
  }[];
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>({
    id: '1',
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    location: 'New York, USA',
    bio: 'Passionate badminton player with 5 years of experience. Looking for competitive matches and friendly games.',
    joinDate: 'January 2023',
    stats: {
      totalGames: 127,
      winRate: 68,
      favoriteSport: 'Badminton',
      skillLevel: 'Intermediate',
      totalHours: 340
    },
    achievements: [
      '🏆 Tournament Champion - Summer 2024',
      '🥈 Runner-up - City Championship 2024',
      '⭐ 50+ Games Played',
      '🔥 10 Game Win Streak'
    ],
    recentActivity: [
      {
        date: '2 days ago',
        activity: 'Played Badminton',
        facility: 'Elite Sports Complex'
      },
      {
        date: '5 days ago',
        activity: 'Booked Tennis Court',
        facility: 'Metro Tennis Club'
      },
      {
        date: '1 week ago',
        activity: 'Completed Training Session',
        facility: 'City Badminton Center'
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
            <h1 className="text-3xl font-bold text-gray-900">Player Profile</h1>
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
                
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.location
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Member since {profile.joinDate}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Bio</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Games</span>
                  <span className="text-lg font-semibold text-blue-600">{profile.stats.totalGames}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Win Rate</span>
                  <span className="text-lg font-semibold text-green-600">{profile.stats.winRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Favorite Sport</span>
                  <span className="text-sm font-medium">{profile.stats.favoriteSport}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Skill Level</span>
                  <span className="text-sm font-medium">{profile.stats.skillLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="text-sm font-medium">{profile.stats.totalHours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Achievements & Activity */}
          <div className="lg:col-span-2">
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                    {achievement}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {profile.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                      <p className="text-sm text-gray-500">{activity.facility}</p>
                      <p className="text-xs text-gray-400">{activity.date}</p>
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

export default ProfilePage;
