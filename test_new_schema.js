// Test script for the new QuickCourt database schema
// Run this in your browser console after setting up the new schema

// Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Test the new schema
async function testNewSchema() {
  try {
    console.log('🧪 Testing new QuickCourt database schema...');
    
    // Test 1: Check if users table exists and is accessible
    console.log('\n📋 Test 1: Checking users table...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (usersResponse.ok) {
      console.log('✅ Users table is accessible');
      const usersData = await usersResponse.json();
      console.log('📊 Users found:', usersData.length);
    } else {
      console.error('❌ Users table error:', usersResponse.status);
    }
    
    // Test 2: Check if facility_availability table exists
    console.log('\n🏟️ Test 2: Checking facility_availability table...');
    const facilitiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/facility_availability?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (facilitiesResponse.ok) {
      console.log('✅ Facility availability table is accessible');
      const facilitiesData = await facilitiesResponse.json();
      console.log('📊 Facilities found:', facilitiesData.length);
    } else {
      console.error('❌ Facility availability table error:', facilitiesResponse.status);
    }
    
    // Test 3: Check if facility_owner_stats view exists
    console.log('\n📊 Test 3: Checking facility_owner_stats view...');
    const statsResponse = await fetch(`${SUPABASE_URL}/rest/v1/facility_owner_stats?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (statsResponse.ok) {
      console.log('✅ Facility owner stats view is accessible');
      const statsData = await statsResponse.json();
      console.log('📊 Stats records found:', statsData.length);
    } else {
      console.error('❌ Facility owner stats view error:', statsResponse.status);
    }
    
    // Test 4: Check table structure
    console.log('\n🏗️ Test 4: Checking table structure...');
    
    // Check users table structure
    const usersStructureResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=0`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (usersStructureResponse.ok) {
      const usersColumns = usersStructureResponse.headers.get('x-columns');
      console.log('📋 Users table columns:', usersColumns);
    }
    
    // Check facility_availability table structure
    const facilitiesStructureResponse = await fetch(`${SUPABASE_URL}/rest/v1/facility_availability?select=*&limit=0`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (facilitiesStructureResponse.ok) {
      const facilitiesColumns = facilitiesStructureResponse.headers.get('x-columns');
      console.log('📋 Facility availability table columns:', facilitiesColumns);
    }
    
    console.log('\n🎉 Schema testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test user registration flow
async function testUserRegistration() {
  try {
    console.log('\n👤 Testing user registration flow...');
    
    // This would normally be done through your app's registration form
    // Here we're just testing if the table structure supports it
    
    const testUserData = {
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'facility_owner',
      status: 'active'
    };
    
    console.log('📝 Test user data:', testUserData);
    console.log('ℹ️ Note: Actual user creation should be done through your app');
    
  } catch (error) {
    console.error('❌ User registration test failed:', error);
  }
}

// Test property creation flow
async function testPropertyCreation() {
  try {
    console.log('\n🏟️ Testing property creation flow...');
    
    const testPropertyData = {
      user_id: 'test-user-id', // This would be a real UUID in practice
      property_name: 'Test Basketball Court',
      property_type: 'basketball_court',
      address: '123 Test St, Test City',
      description: 'A test basketball court',
      current_status: 'active',
      is_sold: false,
      price_per_hour: 25.00
    };
    
    console.log('📝 Test property data:', testPropertyData);
    console.log('ℹ️ Note: Actual property creation should be done through your app');
    
  } catch (error) {
    console.error('❌ Property creation test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting QuickCourt schema tests...\n');
  
  await testNewSchema();
  await testUserRegistration();
  await testPropertyCreation();
  
  console.log('\n✨ All tests completed!');
  console.log('\n📚 Next steps:');
  console.log('1. Test user registration in your app');
  console.log('2. Test property creation as a facility owner');
  console.log('3. Verify dashboard statistics are working');
  console.log('4. Check that properties are properly mapped to users');
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.testNewSchema = testNewSchema;
  window.testUserRegistration = testUserRegistration;
  window.testPropertyCreation = testPropertyCreation;
  window.runAllTests = runAllTests;
  
  console.log('🧪 QuickCourt schema test functions loaded!');
  console.log('Run runAllTests() to test everything');
  console.log('Or run individual tests: testNewSchema(), testUserRegistration(), testPropertyCreation()');
}
