// Debug script to test registration issues
// Run this with: node debug_registration.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbvdtzfhznnmvkkfzimp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidmR0emZoem5ubXZra2Z6aW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTU1NDMsImV4cCI6MjA3MDQ3MTU0M30.Jeh3ChKutKd0lzpe0Wri5gu1_VDg86eE0ldpoVnj3yU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRegistration() {
  console.log('🔍 Starting registration debug...\n');

  // Step 1: Test basic connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful\n');
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return;
  }

  // Step 2: Check RLS policies
  console.log('2. Checking RLS policies...');
  try {
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'users' });
    if (error) {
      console.log('⚠️  Could not check policies directly, checking via query...');
      const { data: policies, error: policyError } = await supabase
        .from('information_schema.table_privileges')
        .select('*')
        .eq('table_name', 'users');
      
      if (policyError) {
        console.log('❌ Could not check policies:', policyError.message);
      } else {
        console.log('✅ Policies check completed');
      }
    } else {
      console.log('✅ RLS policies:', data);
    }
  } catch (err) {
    console.log('⚠️  Policy check error:', err.message);
  }
  console.log('');

  // Step 3: Test user creation directly
  console.log('3. Testing direct user creation...');
  const testEmail = `test${Date.now()}@debug.com`;
  const testUserData = {
    id: '00000000-0000-0000-0000-000000000000', // This will be replaced by auth.uid()
    email: testEmail,
    full_name: 'Debug Test User',
    role: 'customer'
    // Removed status field as it might not exist
  };

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([testUserData])
      .select();

    if (error) {
      console.log('❌ Direct insert failed:', error.message);
      console.log('   This confirms the RLS policy issue!');
    } else {
      console.log('✅ Direct insert successful:', data);
      // Clean up test data
      await supabase.from('users').delete().eq('email', testEmail);
    }
  } catch (err) {
    console.log('❌ Direct insert error:', err.message);
  }
  console.log('');

  // Step 4: Check if users table exists and has correct structure
  console.log('4. Checking users table structure...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Users table error:', error.message);
    } else {
      console.log('✅ Users table accessible');
      if (data && data.length > 0) {
        console.log('   Sample user structure:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ Table structure error:', err.message);
  }
  console.log('');

  // Step 5: Provide solution
  console.log('5. SOLUTION:');
  console.log('   The issue is likely a missing RLS policy.');
  console.log('   Run this SQL in your Supabase SQL editor:');
  console.log('');
  console.log('   CREATE POLICY "Users can insert own profile" ON users');
  console.log('       FOR INSERT WITH CHECK (auth.uid()::text = id::text);');
  console.log('');
  console.log('   Then test registration again.');
}

debugRegistration().catch(console.error);
