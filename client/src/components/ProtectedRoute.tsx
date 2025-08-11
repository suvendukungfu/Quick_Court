import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'facility_owner' | 'admin' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  
  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
  console.log('ProtectedRoute: user =', user);
  console.log('ProtectedRoute: requiredRole =', requiredRole);
  console.log('ProtectedRoute: user?.role =', user?.role);

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log('ProtectedRoute: Role mismatch, redirecting');
    // Redirect to appropriate dashboard based on user role
    const dashboardPaths = {
      user: '/home',
      customer: '/home',
      facility_owner: '/owner/dashboard',
      admin: '/admin/dashboard',
    };
    const redirectPath = dashboardPaths[user?.role || 'user'];
    console.log('ProtectedRoute: Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
}