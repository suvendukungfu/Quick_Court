export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'user' | 'facility_owner' | 'admin';
  status: 'active' | 'banned';
  createdAt: Date;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  address: string;
  ownerId: string;
  sports: string[];
  amenities: string[];
  photos: string[];
  rating: number;
  reviewCount: number;
  status: 'pending' | 'approved' | 'rejected';
  priceRange: {
    min: number;
    max: number;
  };
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

export interface Court {
  id: string;
  facilityId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHours: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  facilityId: string;
  courtId: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
}

export interface TimeSlot {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBlocked: boolean;
  reason?: string;
}

export interface Review {
  id: string;
  userId: string;
  facilityId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}