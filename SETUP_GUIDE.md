# QuickCourt Database Schema Update Guide

## 🚀 Overview

This guide will help you set up the new database schema that ensures:
- Every new registration generates a unique user ID
- Facility owners are properly mapped to their properties
- Users can see their total active and non-active sites
- Proper role-based access control

## 📋 Prerequisites

- Access to your Supabase project
- Supabase SQL editor access
- Basic understanding of database operations

## 🔧 Step 1: Run the Database Schema Update

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the entire content from `database_schema_update.sql`**
4. **Click "Run" to execute the script**

This will:
- Drop existing tables (if any)
- Create new `users` table with UUID primary keys
- Create new `facility_availability` table with proper user mapping
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Create a statistics view for facility owners

## 🗄️ New Database Structure

### Users Table
```sql
users (
  id UUID PRIMARY KEY (auto-generated),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL (customer/facility_owner/admin),
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  business_name TEXT, -- For facility owners
  business_address TEXT, -- For facility owners
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Facility Availability Table
```sql
facility_availability (
  id UUID PRIMARY KEY (auto-generated),
  user_id UUID REFERENCES users(id),
  property_name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  current_status TEXT DEFAULT 'active',
  is_sold BOOLEAN DEFAULT FALSE,
  price_per_hour DECIMAL DEFAULT 25.00,
  operating_hours JSONB,
  contact_phone TEXT,
  contact_email TEXT,
  -- Booking tracking fields
  current_booking_start TIMESTAMPTZ,
  current_booking_end TIMESTAMPTZ,
  next_available_time TIMESTAMPTZ,
  total_booked_hours DECIMAL DEFAULT 0,
  monthly_booked_hours DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## 🔐 Row Level Security (RLS) Policies

The new schema includes comprehensive security policies:

- **Users can only view/edit their own profile**
- **Facility owners can only manage their own properties**
- **Customers can view active, non-sold properties**
- **Admins have full access to everything**

## 📊 Facility Owner Statistics View

A new view `facility_owner_stats` provides:
- Total properties count
- Active vs. maintenance vs. sold properties
- Total and monthly booked hours
- Estimated monthly revenue

## 🧪 Testing the Setup

### 1. Test User Registration
1. Go to your app's registration page
2. Register a new user with role "facility_owner"
3. Check the `users` table in Supabase
4. Verify the user was created with a unique UUID

### 2. Test Property Creation
1. Login as the facility owner
2. Go to "Post Property" page
3. Create a new property
4. Check the `facility_availability` table
5. Verify the `user_id` matches the owner's UUID

### 3. Test Dashboard Statistics
1. Go to the facility owner dashboard
2. Verify you can see:
   - Total venues count
   - Active/inactive/sold status breakdown
   - Performance metrics
   - Revenue estimates

## 🔍 Troubleshooting

### Common Issues:

1. **"Table doesn't exist" errors**
   - Make sure you ran the complete SQL script
   - Check if tables were created successfully

2. **Permission denied errors**
   - Verify RLS policies are in place
   - Check if user authentication is working

3. **Properties not showing**
   - Verify the `user_id` in `facility_availability` matches the logged-in user
   - Check if RLS policies allow the user to view the data

4. **Registration fails**
   - Check browser console for errors
   - Verify both Supabase Auth and users table creation succeeded

### Debug Steps:

1. **Check browser console** for detailed error messages
2. **Use the "Test DB Connection" button** in the dashboard
3. **Verify table structure** in Supabase dashboard
4. **Check RLS policies** are enabled and correct

## 📱 Frontend Changes Made

The following files have been updated to work with the new schema:

- `shared/schema.ts` - Updated database schema definitions
- `client/src/lib/supabase.ts` - Updated API functions
- `client/src/contexts/AuthContext.tsx` - Enhanced user management
- `client/src/pages/owner/PostPropertyPage.tsx` - Updated property creation
- `client/src/pages/owner/OwnerDashboard.tsx` - Enhanced statistics display

## 🎯 Key Benefits

1. **Unique User IDs**: Every user gets a UUID that's guaranteed to be unique
2. **Proper Mapping**: Facility owners are correctly linked to their properties
3. **Real-time Statistics**: Dashboard shows live counts and performance metrics
4. **Security**: Row-level security ensures users only see their own data
5. **Scalability**: UUID-based system can handle millions of users
6. **Performance**: Proper indexing for fast queries

## 🚨 Important Notes

- **This will drop existing data** - make sure to backup if needed
- **Test thoroughly** in development before applying to production
- **Update environment variables** if you changed any table names
- **Monitor performance** after the changes

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the SQL script executed successfully
3. Check Supabase logs for backend errors
4. Ensure all environment variables are set correctly

---

**Happy coding! 🎉**

Your QuickCourt application now has a robust, scalable database foundation with proper user management and facility mapping.
