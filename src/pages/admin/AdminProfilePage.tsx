import React, { useState } from 'react';
import { User, Shield, BarChart3, Users, AlertTriangle, Edit2, Camera, Activity, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalFacilities: number;
  pendingApprovals: number;
  reportsToday: number;
  systemUptime: string;
  totalRevenue: number;
}

interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  permissions: string[];
  joinDate: string;
  lastLogin: string;
  stats: AdminStats;
  recentActivity: {
    date: string;
    action: string;
    details: string;
  }[];
  systemHealth: {
    service: string;
    status: 'operational' | 'degraded' | 'down';
    uptime: string;
  }[];
}

const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>({
    id: '3',
    fullName: 'Michael Chen',
    email: 'michael.chen@quickcourt.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'admin',
    department: 'Platform Operations',
    permissions: ['User Management', 'Facility Approval', 'Content Moderation', 'System Monitoring', 'Analytics'],
    joinDate: 'January 2022',
    lastLogin: '2 minutes ago',
    stats: {
      totalUsers: 2847,
      totalFacilities: 156,
      pendingApprovals: 12,
      reportsToday: 3,
      systemUptime: '99.9%',
      totalRevenue: 125680
    },
    recentActivity: [
      {
        date: '5 minutes ago',
        action: 'Approved facility',
        details: 'Green Valley Sports Complex'
      },
      {
        date: '1 hour ago',
        action: 'Resolved user report',
        details: 'Spam content removed'
      },
      {
        date: '3 hours ago',
        action: 'System maintenance',
        details: 'Database optimization completed'
      },
      {
        date: '6 hours ago',
        action: 'User suspension',
        details: 'Policy violation - User #1247'
      }
    ],
    systemHealth: [
      {
        service: 'Web Application',
        status: 'operational',
        uptime: '99.9%'
      },
      {
        service: 'Database',
        status: 'operational',
        uptime: '99.8%'
      },
      {
        service: 'Payment Gateway',
        status: 'operational',
        uptime: '100%'
      },
      {
        service: 'Email Service',
        status: 'degraded',
        uptime: '98.5%'
      }
    ]
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically make an API call to save the profile
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Administrator Profile</h1>
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
                  <Shield className="w-4 h-4 inline mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    profile.department
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Admin since {profile.joinDate}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Last login: {profile.lastLogin}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.permissions.map((permission, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="text-lg font-semibold text-blue-600">{profile.stats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Facilities</span>
                  <span className="text-lg font-semibold text-green-600">{profile.stats.totalFacilities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Approvals</span>
                  <span className="text-lg font-semibold text-yellow-600">{profile.stats.pendingApprovals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reports Today</span>
                  <span className="text-lg font-semibold text-red-600">{profile.stats.reportsToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="text-lg font-semibold text-green-600">{profile.stats.systemUptime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-lg font-semibold text-green-600">${profile.stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - System Health & Activity */}
          <div className="lg:col-span-2">
            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                System Health
              </h3>
              <div className="space-y-3">
                {profile.systemHealth.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{service.service}</p>
                      <p className="text-sm text-gray-600">Uptime: {service.uptime}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {profile.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
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

export default AdminProfilePage;
