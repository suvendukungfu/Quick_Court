import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserLayout from './layouts/UserLayout';
import FacilityOwnerLayout from './layouts/FacilityOwnerLayout';
import AdminLayout from './layouts/AdminLayout';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  switch (user.role) {
    case 'user':
      return <UserLayout>{children}</UserLayout>;
    case 'facility_owner':
      return <FacilityOwnerLayout>{children}</FacilityOwnerLayout>;
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;
    default:
      return <>{children}</>;
  }
}