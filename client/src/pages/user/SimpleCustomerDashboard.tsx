import React from 'react';

export default function SimpleCustomerDashboard() {
  console.log('SimpleCustomerDashboard: Component rendering...');
  
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          Simple Customer Dashboard
        </h1>
        <p className="text-xl text-blue-700 mb-4">
          If you can see this, the routing and basic rendering is working!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-800">
            Current time: {new Date().toLocaleTimeString()}
          </p>
          <p className="text-gray-600 mt-2">
            This is a minimal test component to debug the white screen issue.
          </p>
        </div>
      </div>
    </div>
  );
}
