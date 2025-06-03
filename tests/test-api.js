// Test script for NextAuth API endpoints

// Helper function to handle responses
async function handleResponse(response, endpoint) {
  console.log(`${endpoint} status:`, response.status);
  
  // Clone the response before reading it
  const responseClone = response.clone();
  
  try {
    const data = await response.json();
    console.log(`${endpoint} data:`, data);
    return data;
  } catch (e) {
    console.log(`Could not parse ${endpoint} response as JSON:`, e.message);
    
    // Try to get the text response from the cloned response
    try {
      const text = await responseClone.text();
      console.log(`${endpoint} text (truncated):`, text.substring(0, 300) + '...');
    } catch (textError) {
      console.log(`Could not get ${endpoint} response text:`, textError.message);
    }
    return null;
  }
}

// Test the CSRF token endpoint
async function testCsrfEndpoint() {
  try {
    console.log('\nTesting CSRF endpoint...');
    const response = await fetch('https://pejuangkorea.vercel.app/api/auth/csrf');
    return await handleResponse(response, 'CSRF endpoint');
  } catch (error) {
    console.error('Error testing CSRF endpoint:', error);
    return null;
  }
}

// Test the session endpoint
async function testSessionEndpoint() {
  try {
    console.log('\nTesting session endpoint...');
    const response = await fetch('https://pejuangkorea.vercel.app/api/auth/session');
    return await handleResponse(response, 'Session endpoint');
  } catch (error) {
    console.error('Error testing session endpoint:', error);
    return null;
  }
}

// Test the signin endpoint
async function testSigninEndpoint(csrfToken) {
  try {
    console.log('\nTesting signin endpoint...');
    const response = await fetch('https://pejuangkorea.vercel.app/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        csrfToken: csrfToken || '',
        redirect: false,
      }),
    });
    return await handleResponse(response, 'Signin endpoint');
  } catch (error) {
    console.error('Error testing signin endpoint:', error);
    return null;
  }
}

// Run the tests in sequence
async function runTests() {
  // First, get the CSRF token
  const csrfData = await testCsrfEndpoint();
  const csrfToken = csrfData?.csrfToken;
  
  // Then test the session endpoint
  await testSessionEndpoint();
  
  // Finally, test the signin endpoint with the CSRF token
  if (csrfToken) {
    await testSigninEndpoint(csrfToken);
  } else {
    await testSigninEndpoint();
  }
}

// Run all tests
runTests();
