// Facility Types for QuickCourt
// Matches the new database schema

export interface Facility {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  facility_type: FacilityType;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  contact_email?: string;
  website_url?: string;
  status: FacilityStatus;
  is_verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export type FacilityType = 
  | 'basketball_court'
  | 'tennis_court'
  | 'volleyball_court'
  | 'badminton_court'
  | 'soccer_field'
  | 'baseball_field'
  | 'swimming_pool'
  | 'gym'
  | 'multi_sport'
  | 'other';

export type FacilityStatus = 'active' | 'inactive' | 'maintenance' | 'closed' | 'banned';

export interface FacilityAmenity {
  id: string;
  facility_id: string;
  amenity_name: string;
  amenity_type?: AmenityType;
  description?: string;
  is_available: boolean;
  created_at: string;
}

export type AmenityType = 'equipment' | 'service' | 'infrastructure' | 'safety' | 'comfort';

export interface FacilityImage {
  id: string;
  facility_id: string;
  image_url: string;
  image_type: ImageType;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type ImageType = 'main' | 'gallery' | 'thumbnail';

export interface FacilitySchedule {
  id: string;
  facility_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  special_hours?: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityPricing {
  id: string;
  facility_id: string;
  pricing_type: PricingType;
  base_price: number;
  currency?: string;
  peak_hour_multiplier?: number;
  off_peak_discount?: number;
  weekend_multiplier?: number;
  holiday_multiplier?: number;
  minimum_booking_hours?: number;
  maximum_booking_hours?: number;
  cancellation_policy?: string;
  deposit_required?: boolean;
  deposit_amount?: number;
  created_at: string;
  updated_at: string;
}

export type PricingType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal';

export interface FacilityAvailabilitySlot {
  id: string;
  facility_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
  booking_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'maintenance';

export interface FacilityReview {
  id: string;
  facility_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  review_text?: string;
  review_title?: string;
  is_verified_booking: boolean;
  is_helpful_count: number;
  is_reported: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'active' | 'hidden' | 'removed';

export interface FacilityBooking {
  id: string;
  facility_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  transaction_id?: string;
  special_requests?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface FacilityNotification {
  id: string;
  facility_id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export type NotificationType = 
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancellation'
  | 'facility_update'
  | 'maintenance_alert'
  | 'review_received';

export interface FacilityStats {
  facility_id: string;
  facility_name: string;
  owner_id: string;
  owner_name: string;
  facility_type: FacilityType;
  status: FacilityStatus;
  is_verified: boolean;
  featured: boolean;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  positive_reviews: number;
  created_at: string;
  updated_at: string;
}

// Extended interfaces for API responses
export interface FacilityWithDetails extends Facility {
  amenities?: FacilityAmenity[];
  images?: FacilityImage[];
  schedules?: FacilitySchedule[];
  pricing?: FacilityPricing;
  reviews?: FacilityReview[];
  stats?: FacilityStats;
}

export interface CreateFacilityRequest {
  name: string;
  description?: string;
  facility_type: FacilityType;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  contact_email?: string;
  website_url?: string;
}

export interface UpdateFacilityRequest extends Partial<CreateFacilityRequest> {
  status?: FacilityStatus;
  is_verified?: boolean;
  featured?: boolean;
}

export interface CreateBookingRequest {
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  special_requests?: string;
}

export interface CreateReviewRequest {
  facility_id: string;
  booking_id?: string;
  rating: number;
  review_text?: string;
  review_title?: string;
}

// Filter and search interfaces
export interface FacilityFilters {
  facility_type?: FacilityType[];
  city?: string;
  state?: string;
  status?: FacilityStatus;
  is_verified?: boolean;
  featured?: boolean;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  amenities?: string[];
  date?: string;
  time?: string;
}

export interface FacilitySearchParams {
  query?: string;
  filters?: FacilityFilters;
  sort_by?: 'name' | 'rating' | 'price' | 'distance' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
