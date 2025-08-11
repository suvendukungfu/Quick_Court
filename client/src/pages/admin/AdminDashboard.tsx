import React from 'react';
import { Users, Building, AlertTriangle, DollarSign, TrendingUp, Calendar, Activity, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Facilities',
      value: '156',
      change: '+8.2%',
      changeType: 'increase', 
      icon: Building,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Approvals',
      value: '12',
      change: '-4.1%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'bg-yellow-500'
    },
    {
      title: 'Revenue This Month',
      value: '$125,680',
      change: '+15.3%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New facility approved',
      details: 'Green Valley Sports Complex',
      time: '5 minutes ago',
      type: 'approval'
    },
    {
      id: 2,
      action: 'User report resolved',
      details: 'Spam content removed',
      time: '1 hour ago',
      type: 'moderation'
    },
    {
      id: 3,
      action: 'System maintenance completed',
      details: 'Database optimization',
      time: '3 hours ago',
      type: 'system'
    },
    {
      id: 4,
      action: 'New user registration',
      details: 'Premium member signup',
      time: '6 hours ago',
      type: 'user'
    }
  ];

  const systemHealth = [
    { service: 'Web Application', status: 'operational', uptime: '99.9%' },
    { service: 'Database', status: 'operational', uptime: '99.8%' },
    { service: 'Payment Gateway', status: 'operational', uptime: '100%' },
    { service: 'Email Service', status: 'degraded', uptime: '98.5%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and system monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'approval' ? 'bg-green-500' :
                        activity.type === 'moderation' ? 'bg-red-500' :
                        activity.type === 'system' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemHealth.map((system) => (
                  <div key={system.service} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{system.service}</p>
                      <p className="text-xs text-gray-500">Uptime: {system.uptime}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(system.status)}`}>
                      {system.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Approve Facilities</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">Review Reports</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}