import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import HomePage from './pages/user/HomePage';
import VenuesPage from './pages/user/VenuesPage';
import VenueDetailsPage from './pages/user/VenueDetailsPage';
import AboutUsPage from './pages/AboutUsPage';

// Placeholder components for other pages
const BookingPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Booking Page</h1><p>Court booking functionality coming soon...</p></div>;
const MyBookingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">My Bookings</h1><p>View your bookings here...</p></div>;

// Import new profile pages
import ProfilePage from './pages/user/ProfilePage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

const OwnerDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Owner Dashboard</h1><p>Analytics and KPIs coming soon...</p></div>;
const OwnerFacilities = () => <div className="p-8"><h1 className="text-2xl font-bold">Facility Management</h1><p>Manage your facilities here...</p></div>;
const OwnerTimeSlots = () => <div className="p-8"><h1 className="text-2xl font-bold">Time Slot Management</h1><p>Manage time slots here...</p></div>;
const OwnerBookings = () => <div className="p-8"><h1 className="text-2xl font-bold">Booking Overview</h1><p>View facility bookings here...</p></div>;

const AdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p>Global statistics coming soon...</p></div>;
const AdminUsers = () => <div className="p-8"><h1 className="text-2xl font-bold">User Management</h1><p>Manage users here...</p></div>;
const AdminFacilities = () => <div className="p-8"><h1 className="text-2xl font-bold">Facility Approval</h1><p>Approve facilities here...</p></div>;
const AdminReports = () => <div className="p-8"><h1 className="text-2xl font-bold">Reports & Moderation</h1><p>View reports here...</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route path="/home" element={
              <ProtectedRoute requiredRole="user">
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/venues" element={
              <ProtectedRoute requiredRole="user">
                <VenuesPage />
              </ProtectedRoute>
            } />
            <Route path="/venues/:id" element={
              <ProtectedRoute requiredRole="user">
                <VenueDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/book/:facilityId/:courtId" element={
              <ProtectedRoute requiredRole="user">
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute requiredRole="user">
                <MyBookingsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="user">
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<AboutUsPage />} />

            {/* Facility Owner Routes */}
            <Route path="/owner/dashboard" element={
              <ProtectedRoute requiredRole="facility_owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/owner/facilities" element={
              <ProtectedRoute requiredRole="facility_owner">
                <OwnerFacilities />
              </ProtectedRoute>
            } />
            <Route path="/owner/timeslots" element={
              <ProtectedRoute requiredRole="facility_owner">
                <OwnerTimeSlots />
              </ProtectedRoute>
            } />
            <Route path="/owner/bookings" element={
              <ProtectedRoute requiredRole="facility_owner">
                <OwnerBookings />
              </ProtectedRoute>
            } />
            <Route path="/owner/profile" element={
              <ProtectedRoute requiredRole="facility_owner">
                <OwnerProfilePage />
              </ProtectedRoute>
            } />

      
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/facilities" element={
              <ProtectedRoute requiredRole="admin">
                <AdminFacilities />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requiredRole="admin">
                <AdminReports />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute requiredRole="admin">
                <AdminProfilePage />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;