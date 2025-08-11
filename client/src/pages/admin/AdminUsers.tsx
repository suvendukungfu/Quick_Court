import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Ban, Shield, Eye, Mail, Phone, Calendar, Users, Building, ChevronDown, ChevronRight } from 'lucide-react';
import { users as usersApi, facilities as facilitiesApi } from '../../lib/supabase';
import { User } from '../../types';
import { Facility } from '../../types/facility';

interface AdminUser extends User {
  facilities?: Facility[];
  totalFacilities: number;
  lastActive?: string;
  totalBookings?: number;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOwners, setExpandedOwners] = useState<Set<string>>(new Set());

  // Fetch users and their facilities
  useEffect(() => {
    const fetchUsersAndFacilities = async () => {
      try {
        setLoading(true);
        
        // Fetch all users
        const { data: usersData, error: usersError } = await usersApi.getAll();
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
          return;
        }
        
        // Fetch facilities for facility owners
        const { data: allFacilities, error: facilitiesError } = await facilitiesApi.getAll();
        
        if (facilitiesError) {
          console.error('Error fetching facilities:', facilitiesError);
          return;
        }
        
        // Map users with their facilities
        const usersWithFacilities: AdminUser[] = (usersData || []).map(user => {
          const userFacilities = (allFacilities || []).filter(
            (facility: any) => facility.owner_id === user.id
          );
          
          return {
            ...user,
            facilities: userFacilities,
            totalFacilities: userFacilities.length,
            totalBookings: 0, // Will be implemented when bookings are added
            lastActive: 'Recently' // Will be implemented when user activity tracking is added
          };
        });
        
        setUsers(usersWithFacilities);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersAndFacilities();
  }, []);

  const mockUsers: AdminUser[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      role: 'user',
      status: 'active',
      joinDate: '2023-01-15',
      lastActive: '2 hours ago',
      totalBookings: 42,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Sarah Williams',
      email: 'sarah.williams@elitecomplex.com',
      role: 'facility_owner',
      status: 'active',
      joinDate: '2020-03-10',
      lastActive: '1 day ago',
      totalBookings: 0,
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@quickcourt.com',
      role: 'admin',
      status: 'active',
      joinDate: '2022-01-08',
      lastActive: '5 minutes ago',
      totalBookings: 0,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      role: 'user',
      status: 'suspended',
      joinDate: '2023-06-20',
      lastActive: '1 week ago',
      totalBookings: 15,
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '5',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'user',
      status: 'pending',
      joinDate: '2024-01-02',
      lastActive: 'Never',
      totalBookings: 0,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle expanded state for facility owners
  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedOwners);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedOwners(newExpanded);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'facility_owner': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users and facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="facility_owner">Facility Owners</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Join Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Facilities</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Last Active</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || 'User'}&size=40`}
                          alt={user.fullName || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      {user.role === 'facility_owner' ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{user.totalFacilities} facilities</span>
                          {user.totalFacilities > 1 && (
                            <button
                              onClick={() => toggleExpanded(user.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              {expandedOwners.has(user.id) ? (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="w-4 h-4 mr-1" />
                                  Show All
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.lastActive || 'Recently'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <Mail className="h-4 w-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="p-2 text-green-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded facilities row for facility owners */}
                  {user.role === 'facility_owner' && expandedOwners.has(user.id) && user.facilities && user.facilities.length > 0 && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-6 py-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <Building className="w-4 h-4 mr-2 text-blue-500" />
                            {user.fullName}'s Facilities
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.facilities.map((facility) => (
                              <div key={facility.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">{facility.name}</h5>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    facility.status === 'active' ? 'bg-green-100 text-green-800' :
                                    facility.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {facility.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {facility.facility_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                  {facility.city}, {facility.state}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Created: {new Date(facility.created_at).toLocaleDateString()}</span>
                                  <span className={facility.is_verified ? 'text-green-600' : 'text-gray-400'}>
                                    {facility.is_verified ? '✓ Verified' : 'Unverified'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facility Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'facility_owner').length}
              </p>
            </div>
            <Building className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Facilities</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.reduce((total, user) => total + (user.totalFacilities || 0), 0)}
              </p>
            </div>
            <Building className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}