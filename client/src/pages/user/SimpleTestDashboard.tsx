import React from 'react';

export default function SimpleTestDashboard() {
  console.log('SimpleTestDashboard rendering...');
  
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Simple Test Dashboard</h1>
        <p className="text-blue-700 mb-4">If you can see this, the component is working!</p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-800">This is a minimal test component to debug the white screen issue.</p>
          <p className="text-gray-600 mt-2">Current time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
