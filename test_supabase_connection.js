// Test script to verify Supabase connection and table structure
// Run this in your browser console or Node.js environment

// Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Test connection
async function testSupabaseConnection() {
  try {
    // Test basic connection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/facility_properties?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
      
      // Test table structure
      const structureResponse = await fetch(`${SUPABASE_URL}/rest/v1/facility_properties?select=*&limit=0`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (structureResponse.ok) {
        console.log('✅ Table structure accessible');
        
        // Get actual columns from response headers
        const columns = structureResponse.headers.get('x-columns');
        console.log('📋 Available columns:', columns);
        
      } else {
        console.error('❌ Table structure error:', structureResponse.status);
      }
      
    } else {
      console.error('❌ Supabase connection failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

// Run the test
testSupabaseConnection();
