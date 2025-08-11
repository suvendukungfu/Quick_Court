import React, { useState } from 'react';
import { Search, Filter, Flag, Eye, MessageSquare, User, Clock, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface Report {
  id: string;
  type: 'user' | 'facility' | 'content' | 'payment';
  title: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  targetName: string;
  targetType: 'user' | 'facility' | 'booking';
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitDate: string;
  resolvedDate?: string;
  resolvedBy?: string;
}

export default function AdminReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const mockReports: Report[] = [
    {
      id: '1',
      type: 'user',
      title: 'Inappropriate behavior during game',
      description: 'User was using offensive language and being aggressive towards other players during the badminton session.',
      reporterName: 'Alice Smith',
      reporterEmail: 'alice.smith@email.com',
      targetName: 'John Doe',
      targetType: 'user',
      status: 'pending',
      priority: 'high',
      submitDate: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'facility',
      title: 'Poor facility maintenance',
      description: 'The tennis court has several cracks and the net is torn. Safety concerns for players.',
      reporterName: 'Mike Johnson',
      reporterEmail: 'mike.j@email.com',
      targetName: 'City Tennis Club',
      targetType: 'facility',
      status: 'resolved',
      priority: 'medium',
      submitDate: '2024-01-12T14:15:00Z',
      resolvedDate: '2024-01-14T09:00:00Z',
      resolvedBy: 'Admin Team'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Unauthorized charge',
      description: 'I was charged for a booking that I cancelled within the cancellation period.',
      reporterName: 'Sarah Wilson',
      reporterEmail: 'sarah.w@email.com',
      targetName: 'Booking #12345',
      targetType: 'booking',
      status: 'pending',
      priority: 'urgent',
      submitDate: '2024-01-16T16:45:00Z'
    },
    {
      id: '4',
      type: 'content',
      title: 'Spam in facility description',
      description: 'Facility owner is posting inappropriate links and promotional content in the facility description.',
      reporterName: 'Tom Brown',
      reporterEmail: 'tom.brown@email.com',
      targetName: 'Downtown Sports Center',
      targetType: 'facility',
      status: 'dismissed',
      priority: 'low',
      submitDate: '2024-01-10T11:20:00Z',
      resolvedDate: '2024-01-11T13:30:00Z',
      resolvedBy: 'Content Moderator'
    }
  ];

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return User;
      case 'facility': return MessageSquare;
      case 'content': return Flag;
      case 'payment': return AlertTriangle;
      default: return Flag;
    }
  };

  const handleResolve = (reportId: string) => {
    console.log('Resolving report:', reportId);
    // Here you would make an API call to resolve the report
  };

  const handleDismiss = (reportId: string) => {
    console.log('Dismissing report:', reportId);
    // Here you would make an API call to dismiss the report
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Moderation</h1>
        <p className="text-gray-600 mt-2">Review and moderate user reports and content issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{mockReports.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Flag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'resolved').length}
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
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.priority === 'urgent').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
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
                placeholder="Search reports by title, reporter, or target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="user">User Reports</option>
              <option value="facility">Facility Reports</option>
              <option value="content">Content Reports</option>
              <option value="payment">Payment Issues</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const TypeIcon = getTypeIcon(report.type);
          return (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <TypeIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div><strong>Reporter:</strong> {report.reporterName}</div>
                      <div><strong>Target:</strong> {report.targetName}</div>
                      <div><strong>Type:</strong> {report.type}</div>
                      <div><strong>Date:</strong> {new Date(report.submitDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleResolve(report.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleDismiss(report.id)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedReport.title}</h3>
                <div className="flex space-x-2 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                    {selectedReport.priority} priority
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedReport.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Reporter:</strong> {selectedReport.reporterName}</div>
                <div><strong>Email:</strong> {selectedReport.reporterEmail}</div>
                <div><strong>Target:</strong> {selectedReport.targetName}</div>
                <div><strong>Target Type:</strong> {selectedReport.targetType}</div>
                <div><strong>Report Type:</strong> {selectedReport.type}</div>
                <div><strong>Submitted:</strong> {new Date(selectedReport.submitDate).toLocaleString()}</div>
                {selectedReport.resolvedDate && (
                  <>
                    <div><strong>Resolved:</strong> {new Date(selectedReport.resolvedDate).toLocaleString()}</div>
                    <div><strong>Resolved By:</strong> {selectedReport.resolvedBy}</div>
                  </>
                )}
              </div>
              
              {selectedReport.status === 'pending' && (
                <div className="flex space-x-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleResolve(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Resolve Report</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDismiss(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Dismiss Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}