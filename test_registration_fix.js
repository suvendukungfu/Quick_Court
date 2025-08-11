// Test script to verify registration fix
// Run this in your browser console or as a test

const testRegistration = async () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testUserData = {
    fullName: 'Test User',
    email: testEmail,
    password: testPassword,
    role: 'customer'
  };

  console.log('Testing registration with:', testUserData);

  try {
    // Test the registration process
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    const result = await response.json();
    console.log('Registration result:', result);

    if (response.ok) {
      console.log('✅ Registration successful!');
      return true;
    } else {
      console.error('❌ Registration failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return false;
  }
};

// Test the registration
testRegistration().then(success => {
  if (success) {
    console.log('🎉 Registration fix is working!');
  } else {
    console.log('🔧 Registration still has issues');
  }
});

// Also test the frontend registration flow
const testFrontendRegistration = async () => {
  console.log('Testing frontend registration flow...');
  
  // This would be called from the React component
  // You can test this by actually using the registration form
  console.log('To test frontend registration:');
  console.log('1. Go to the registration page');
  console.log('2. Fill out the form with a new email');
  console.log('3. Submit and check for errors');
};

testFrontendRegistration();
