import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// User management functions
export const users = {
  // Create a new user
  create: async (userData: any) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    return { data, error }
  },

  // Get user by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Get user by email
  getByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return { data, error }
  },

  // Update user
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Get all users (admin only)
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// Property management functions
export const properties = {
  // Create a new property
  create: async (propertyData: any) => {
    const { data, error } = await supabase
      .from('facility_availability')
      .insert([propertyData])
      .select()
    return { data, error }
  },

  // Get all properties (for users to browse)
  getAll: async () => {
    const { data, error } = await supabase
      .from('facility_availability')
      .select(`
        id,
        user_id,
        property_name,
        property_type,
        address,
        description,
        current_status,
        is_sold,
        current_booking_start,
        current_booking_end,
        next_available_time,
        total_booked_hours,
        monthly_booked_hours,
        price_per_hour,
        operating_hours,
        contact_phone,
        contact_email,
        created_at
      `)
      .eq('current_status', 'active')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get properties by owner
  getByOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('facility_availability')
      .select(`
        id,
        user_id,
        property_name,
        property_type,
        address,
        description,
        current_status,
        is_sold,
        current_booking_start,
        current_booking_end,
        next_available_time,
        total_booked_hours,
        monthly_booked_hours,
        price_per_hour,
        operating_hours,
        contact_phone,
        contact_email,
        created_at
      `)
      .eq('user_id', ownerId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Update a property
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('facility_availability')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Delete a property
  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('facility_availability')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Get a property by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('facility_availability')
      .select(`
        id,
        user_id,
        property_name,
        property_type,
        address,
        description,
        current_status,
        is_sold,
        current_booking_start,
        current_booking_end,
        next_available_time,
        total_booked_hours,
        monthly_booked_hours,
        price_per_hour,
        operating_hours,
        contact_phone,
        contact_email,
        created_at
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Test connection to facility_availability table
  testConnection: async () => {
    const { data, error } = await supabase
      .from('facility_availability')
      .select('id')
      .limit(1)
    return { data, error }
  }
}

// Facility owner statistics
export const facilityStats = {
  // Get statistics for a specific facility owner
  getByOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('facility_owner_stats')
      .select('*')
      .eq('user_id', ownerId)
      .single()
    return { data, error }
  },

  // Get all facility owner statistics (admin only)
  getAll: async () => {
    const { data, error } = await supabase
      .from('facility_owner_stats')
      .select('*')
      .order('total_properties', { ascending: false })
    return { data, error }
  }
}