/**
 * Test script for Mobile Vocabulary API endpoints
 * Tests all CRUD operations with authentication
 * 
 * Usage: node tests/api-vocabulary-test.js
 */

const BASE_URL = 'http://localhost:3000';

// Test credentials - update these with valid user credentials
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';
let testCollectionId = null;

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Test authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    const result = await response.json();
    
    if (response.status === 200 && result.success) {
      authToken = result.token;
      console.log('✅ Authentication successful');
      console.log(`🔑 Token: ${authToken.substring(0, 50)}...`);
      return true;
    } else {
      console.log('❌ Authentication failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

// Test GET /api/mobile/vocabulary (list collections)
async function testGetCollections() {
  console.log('\n📚 Testing GET /api/mobile/vocabulary...');
  
  try {
    // Test without query parameters
    const { status, data } = await makeRequest('/api/mobile/vocabulary');
    console.log(`📊 Status: ${status}`);
    console.log(`📋 Collections: ${data.data?.length || 0}`);
    
    if (status === 200 && data.success) {
      console.log('✅ GET collections successful');
      
      // Test with query parameters
      console.log('\n📚 Testing with publicOnly=true...');
      const publicResult = await makeRequest('/api/mobile/vocabulary?publicOnly=true');
      console.log(`📊 Public collections: ${publicResult.data.data?.length || 0}`);
      
      console.log('\n📚 Testing with mine=true...');
      const mineResult = await makeRequest('/api/mobile/vocabulary?mine=true');
      console.log(`📊 My collections: ${mineResult.data.data?.length || 0}`);
      
      return true;
    } else {
      console.log('❌ GET collections failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ GET collections error:', error.message);
    return false;
  }
}

// Test POST /api/mobile/vocabulary (create collection)
async function testCreateCollection() {
  console.log('\n📝 Testing POST /api/mobile/vocabulary...');
  
  const testCollection = {
    title: 'Test Collection API',
    description: 'Test collection created via API',
    isPublic: false
  };
  
  try {
    const { status, data } = await makeRequest('/api/mobile/vocabulary', {
      method: 'POST',
      body: JSON.stringify(testCollection)
    });
    
    console.log(`📊 Status: ${status}`);
    
    if (status === 201 && data.success) {
      testCollectionId = data.data.id;
      console.log('✅ Create collection successful');
      console.log(`🆔 Collection ID: ${testCollectionId}`);
      return true;
    } else {
      console.log('❌ Create collection failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Create collection error:', error.message);
    return false;
  }
}

// Test GET /api/mobile/vocabulary/:id (get specific collection)
async function testGetSpecificCollection() {
  if (!testCollectionId) {
    console.log('⚠️ Skipping GET specific collection test - no collection ID');
    return false;
  }
  
  console.log('\n📖 Testing GET /api/mobile/vocabulary/:id...');
  
  try {
    const { status, data } = await makeRequest(`/api/mobile/vocabulary/${testCollectionId}`);
    console.log(`📊 Status: ${status}`);
    
    if (status === 200 && data.success) {
      console.log('✅ GET specific collection successful');
      console.log(`📋 Collection: ${data.data.title}`);
      console.log(`📝 Items count: ${data.data.items?.length || 0}`);
      return true;
    } else {
      console.log('❌ GET specific collection failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ GET specific collection error:', error.message);
    return false;
  }
}

// Test PATCH /api/mobile/vocabulary/:id (update collection)
async function testUpdateCollection() {
  if (!testCollectionId) {
    console.log('⚠️ Skipping PATCH collection test - no collection ID');
    return false;
  }
  
  console.log('\n✏️ Testing PATCH /api/mobile/vocabulary/:id...');
  
  const updates = {
    title: 'Updated Test Collection',
    description: 'Updated description via API test',
    isPublic: true
  };
  
  try {
    const { status, data } = await makeRequest(`/api/mobile/vocabulary/${testCollectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    
    console.log(`📊 Status: ${status}`);
    
    if (status === 200 && data.success) {
      console.log('✅ Update collection successful');
      console.log(`📋 Updated title: ${data.data.title}`);
      console.log(`🌍 Public: ${data.data.isPublic}`);
      return true;
    } else {
      console.log('❌ Update collection failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Update collection error:', error.message);
    return false;
  }
}

// Test DELETE /api/mobile/vocabulary/:id (delete collection)
async function testDeleteCollection() {
  if (!testCollectionId) {
    console.log('⚠️ Skipping DELETE collection test - no collection ID');
    return false;
  }
  
  console.log('\n🗑️ Testing DELETE /api/mobile/vocabulary/:id...');
  
  try {
    const { status, data } = await makeRequest(`/api/mobile/vocabulary/${testCollectionId}`, {
      method: 'DELETE'
    });
    
    console.log(`📊 Status: ${status}`);
    
    if (status === 200 && data.success) {
      console.log('✅ Delete collection successful');
      console.log(`🗑️ Message: ${data.data.message}`);
      return true;
    } else {
      console.log('❌ Delete collection failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Delete collection error:', error.message);
    return false;
  }
}

// Test error scenarios
async function testErrorScenarios() {
  console.log('\n⚠️ Testing Error Scenarios...');
  
  // Test unauthorized access
  console.log('\n🚫 Testing unauthorized access...');
  const oldToken = authToken;
  authToken = '';
  
  const { status: unauthorizedStatus } = await makeRequest('/api/mobile/vocabulary');
  console.log(`📊 Unauthorized status: ${unauthorizedStatus}`);
  if (unauthorizedStatus === 401) {
    console.log('✅ Unauthorized access properly blocked');
  } else {
    console.log('❌ Unauthorized access not properly handled');
  }
  
  authToken = oldToken;
  
  // Test invalid collection ID
  console.log('\n🔢 Testing invalid collection ID...');
  const { status: invalidIdStatus } = await makeRequest('/api/mobile/vocabulary/invalid');
  console.log(`📊 Invalid ID status: ${invalidIdStatus}`);
  if (invalidIdStatus === 400) {
    console.log('✅ Invalid ID properly handled');
  } else {
    console.log('❌ Invalid ID not properly handled');
  }
  
  // Test non-existent collection
  console.log('\n🔍 Testing non-existent collection...');
  const { status: notFoundStatus } = await makeRequest('/api/mobile/vocabulary/99999');
  console.log(`📊 Not found status: ${notFoundStatus}`);
  if (notFoundStatus === 404) {
    console.log('✅ Non-existent collection properly handled');
  } else {
    console.log('❌ Non-existent collection not properly handled');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Mobile Vocabulary API Tests');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`👤 Test user: ${TEST_CREDENTIALS.email}`);
  
  const results = {
    auth: false,
    getCollections: false,
    createCollection: false,
    getSpecific: false,
    updateCollection: false,
    deleteCollection: false
  };
  
  // Run tests in sequence
  results.auth = await testAuthentication();
  if (!results.auth) {
    console.log('\n❌ Authentication failed. Cannot continue with API tests.');
    console.log('ℹ️ Please ensure:');
    console.log('  - Server is running on localhost:3000');
    console.log('  - Test credentials are valid');
    console.log('  - Database is accessible');
    return;
  }
  
  results.getCollections = await testGetCollections();
  results.createCollection = await testCreateCollection();
  results.getSpecific = await testGetSpecificCollection();
  results.updateCollection = await testUpdateCollection();
  results.deleteCollection = await testDeleteCollection();
  
  await testErrorScenarios();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Results: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the API implementation.');
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
