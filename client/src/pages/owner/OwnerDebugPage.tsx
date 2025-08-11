import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { facilities as facilitiesApi } from '../../lib/supabase';

export default function OwnerDebugPage() {
  const { user, isLoading } = useAuth();

  const testFacilitiesAPI = async () => {
    console.log('Testing facilities API...');
    try {
      const { data, error } = await facilitiesApi.getAll();
      console.log('Facilities API test result:', { data, error });
      alert(`API Test Result:\nData: ${data?.length || 0} facilities\nError: ${error?.message || 'None'}`);
    } catch (err) {
      console.error('Facilities API test error:', err);
      alert(`API Test Error: ${err}`);
    }
  };

  const testUserAPI = async () => {
    console.log('Testing user API...');
    try {
      const { data, error } = await facilitiesApi.getByOwner(user?.id || '');
      console.log('User API test result:', { data, error });
      alert(`User API Test Result:\nData: ${data?.length || 0} facilities\nError: ${error?.message || 'None'}`);
    } catch (err) {
      console.error('User API test error:', err);
      alert(`User API Test Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Owner Dashboard Debug</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.id || 'Not loaded'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not loaded'}</p>
            <p><strong>Full Name:</strong> {user?.fullName || 'Not loaded'}</p>
            <p><strong>Role:</strong> {user?.role || 'Not loaded'}</p>
            <p><strong>Status:</strong> {user?.status || 'Not loaded'}</p>
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated:</strong> {!!user ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testFacilitiesAPI}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Facilities API (getAll)
            </button>
            <button
              onClick={testUserAPI}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-4"
            >
              Test User Facilities API (getByOwner)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Console Logs</h2>
          <p className="text-gray-600 mb-4">Check the browser console for detailed logs.</p>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('User:', user);
              console.log('Is Loading:', isLoading);
              console.log('User Role:', user?.role);
              console.log('User ID:', user?.id);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Log Debug Info to Console
          </button>
        </div>
      </div>
    </div>
  );
}
