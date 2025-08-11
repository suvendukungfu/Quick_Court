# New Facility Schema for QuickCourt

## Overview
This document describes the new comprehensive facility/property schema designed specifically for sports facility booking systems. The new schema replaces the old `facility_availability` table with a more robust, scalable structure.

## 🏗️ Database Tables

### 1. `facilities` (Main Property Table)
The core table containing all facility information.

**Key Features:**
- **UUID Primary Key**: Unique identifier for each facility
- **Owner Relationship**: Links to users table via `owner_id`
- **Facility Types**: Basketball, tennis, volleyball, badminton, soccer, baseball, swimming, gym, multi-sport
- **Location Data**: Address, city, state, zip, coordinates
- **Status Management**: Active, inactive, maintenance, closed
- **Verification System**: `is_verified` flag for trusted facilities
- **Featured Facilities**: `featured` flag for premium listings

**Sample Data:**
```sql
INSERT INTO facilities (owner_id, name, description, facility_type, address, city, state, status) VALUES
(gen_random_uuid(), 'Downtown Basketball Court', 'Professional basketball court with NBA regulation size', 'basketball_court', '123 Main St', 'New York', 'NY', 'active');
```

### 2. `facility_amenities` (Amenities Table)
Stores amenities and features for each facility.

**Features:**
- **Amenity Types**: Equipment, service, infrastructure, safety, comfort
- **Availability Tracking**: `is_available` flag
- **Flexible Structure**: Can store any type of amenity

**Sample Data:**
```sql
INSERT INTO facility_amenities (facility_id, amenity_name, amenity_type, description) VALUES
(facility_id, 'Basketball Hoops', 'equipment', 'NBA regulation height hoops'),
(facility_id, 'Parking', 'infrastructure', 'Free parking available'),
(facility_id, 'Locker Rooms', 'comfort', 'Clean locker rooms with showers');
```

### 3. `facility_images` (Image Management)
Handles multiple images per facility with different types.

**Features:**
- **Image Types**: Main, gallery, thumbnail
- **Display Order**: Control image sequence
- **Active/Inactive**: Toggle image visibility

### 4. `facility_schedules` (Operating Hours)
Manages operating hours for each day of the week.

**Features:**
- **Day-based Scheduling**: 0=Sunday, 1=Monday, etc.
- **Flexible Hours**: Open/close times per day
- **Special Hours**: Text field for special occasions
- **Closed Days**: `is_closed` flag

### 5. `facility_pricing` (Pricing Structure)
Comprehensive pricing management with multipliers and policies.

**Features:**
- **Pricing Types**: Hourly, daily, weekly, monthly, seasonal
- **Dynamic Pricing**: Peak/off-peak multipliers
- **Booking Limits**: Min/max booking hours
- **Cancellation Policies**: Text-based policy storage
- **Deposit System**: Optional deposits

### 6. `facility_availability_slots` (Time Slot Management)
Manages individual time slots for booking.

**Features:**
- **Date/Time Slots**: Specific availability periods
- **Status Tracking**: Available, booked, blocked, maintenance
- **Booking Reference**: Links to actual bookings
- **Notes**: Additional slot information

### 7. `facility_reviews` (Review System)
Comprehensive review and rating system.

**Features:**
- **Rating System**: 1-5 star ratings
- **Verified Bookings**: Track reviews from actual bookings
- **Helpful Votes**: Community voting system
- **Moderation**: Report and status management

### 8. `facility_bookings` (Booking Management)
Complete booking lifecycle management.

**Features:**
- **Booking States**: Pending, confirmed, cancelled, completed, no-show
- **Payment Tracking**: Payment status and methods
- **Cancellation Handling**: Reasons and tracking
- **Special Requests**: Custom booking requirements

### 9. `facility_notifications` (Notification System)
In-app notification management.

**Features:**
- **Notification Types**: Booking confirmations, reminders, alerts
- **Read Status**: Track notification engagement
- **User Targeting**: Facility-specific notifications

## 🔐 Security & Access Control

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Facility Owners**: Can manage their own facilities and related data
- **Public Access**: Anyone can view active facilities and amenities
- **User Privacy**: Users can only access their own bookings and reviews

### Policy Examples:
```sql
-- Facility owners can manage their own facilities
CREATE POLICY "Facility owners can manage own facilities" ON facilities
    FOR ALL USING (owner_id::text = auth.uid()::text);

-- Anyone can view active facilities
CREATE POLICY "Anyone can view active facilities" ON facilities
    FOR SELECT USING (status = 'active');
```

## 📊 Analytics & Reporting

### `facility_stats` View
Provides comprehensive statistics for each facility:

- **Booking Metrics**: Total, completed, cancelled bookings
- **Revenue Tracking**: Total revenue from completed bookings
- **Review Analytics**: Average rating, total reviews, positive reviews
- **Performance Indicators**: All key metrics in one view

## 🚀 Key Improvements Over Old Schema

### 1. **Scalability**
- Separate tables for different concerns (amenities, images, schedules)
- Proper indexing for performance
- UUID primary keys for distributed systems

### 2. **Flexibility**
- Multiple facility types supported
- Dynamic pricing with multipliers
- Flexible amenity system
- Custom operating hours per day

### 3. **User Experience**
- Comprehensive review system
- Notification management
- Booking lifecycle tracking
- Image management

### 4. **Business Features**
- Verification system for trusted facilities
- Featured facility promotion
- Revenue tracking and analytics
- Cancellation policy management

## 🔧 Implementation Guide

### 1. Run the Schema
Execute the `new_property_schema.sql` file in your Supabase SQL editor.

### 2. Update TypeScript Types
The new `facility.ts` file contains all TypeScript interfaces matching the schema.

### 3. Update API Functions
Create new API functions to interact with the new tables:

```typescript
// Example API functions
export const facilities = {
  create: async (facilityData: CreateFacilityRequest) => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  search: async (params: FacilitySearchParams) => { /* ... */ },
  update: async (id: string, updates: UpdateFacilityRequest) => { /* ... */ },
  delete: async (id: string) => { /* ... */ }
};
```

### 4. Update Frontend Components
Update your React components to use the new data structure:

```typescript
// Example component usage
const [facilities, setFacilities] = useState<Facility[]>([]);
const [facilityDetails, setFacilityDetails] = useState<FacilityWithDetails | null>(null);
```

## 📋 Migration Strategy

### Phase 1: Schema Setup
1. Run the new schema SQL
2. Update TypeScript types
3. Create new API functions

### Phase 2: Data Migration
1. Migrate existing facility data to new structure
2. Set up sample data for testing
3. Verify data integrity

### Phase 3: Frontend Updates
1. Update components to use new data structure
2. Implement new features (reviews, notifications, etc.)
3. Test all functionality

### Phase 4: Cleanup
1. Remove old tables and code
2. Update documentation
3. Deploy to production

## 🎯 Benefits

1. **Better Performance**: Proper indexing and normalized structure
2. **Enhanced Features**: Reviews, notifications, dynamic pricing
3. **Scalability**: Can handle thousands of facilities and bookings
4. **User Experience**: Rich facility information and booking process
5. **Business Intelligence**: Comprehensive analytics and reporting
6. **Security**: Proper RLS policies and data protection

## 🔍 Testing

The schema includes sample data for testing:
- 3 sample facilities (basketball, tennis, volleyball)
- Proper relationships between all tables
- Realistic data for development and testing

Run the schema and test the sample data to ensure everything works correctly!
