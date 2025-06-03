// Simple test script to check module API with ID 21

const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000';
const MODULES_API_BASE = `${API_BASE_URL}/api/mobile/modules`;

// Test credentials
const TEST_CREDENTIALS = {
  email: 'murid1@murid.com',
  password: '12345678'
};

let authToken = null;

// Login to get auth token
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await fetch(`${API_BASE_URL}/api/mobile/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data && data.success && data.token) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Test getting module with ID 21
async function testModule21() {
  try {
    console.log('\n🧪 Testing module ID 21...');
    const response = await fetch(`${MODULES_API_BASE}/21`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data && data.success && data.data) {
      const module = data.data;
      
      console.log('\n=== Module Details ===');
      console.log('ID:', module.id);
      console.log('Title:', module.title);
      console.log('Description:', module.description);
      
      console.log('\n=== JSON Description ===');
      console.log('Type:', typeof module.jsonDescription);
      console.log('Content:', module.jsonDescription);
      
      console.log('\n=== HTML Description ===');
      console.log('Type:', typeof module.htmlDescription);
      console.log('Content:', module.htmlDescription);
      
      // Try to parse jsonDescription as JSON
      if (module.jsonDescription) {
        try {
          const parsedJson = JSON.parse(module.jsonDescription);
          console.log('\n=== Parsed JSON Description ===');
          console.log('Successfully parsed as JSON:', parsedJson);
        } catch (e) {
          console.log('\n❌ jsonDescription is NOT valid JSON:', e.message);
          console.log('Content looks like HTML?', module.jsonDescription.includes('<'));
        }
      }
      
      // Save the complete module data to file for analysis
      const dataDir = path.join('..', 'web', 'data');
      const fileName = `module-21-response-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      const filePath = path.join(dataDir, fileName);
      
      try {
        fs.writeFileSync(filePath, JSON.stringify({
          timestamp: new Date().toISOString(),
          moduleId: module.id,
          title: module.title,
          description: module.description,
          jsonDescription: module.jsonDescription,
          htmlDescription: module.htmlDescription,
          fullResponse: data
        }, null, 2));
        console.log(`\n💾 Data saved to: ${filePath}`);
      } catch (saveError) {
        console.error('Error saving data:', saveError);
      }
    }
    
  } catch (error) {
    console.error('Error testing module 21:', error);
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting simple module test for ID 21...');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  await testModule21();
  console.log('\n✅ Test completed!');
}

runTest().catch(console.error);
