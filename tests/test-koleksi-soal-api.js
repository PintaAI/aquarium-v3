const API_BASE_URL = 'http://localhost:3000/api/mobile';

// Test configuration
const TEST_CONFIG = {
  // You need to replace this with a valid JWT token from your auth system
  authToken: 'Bearer your_jwt_token_here',
  testData: {
    koleksiSoal: {
      nama: 'Test Koleksi Soal',
      deskripsi: 'Koleksi soal untuk testing API',
      isPrivate: false
    },
    soal: {
      pertanyaan: 'Apa ibu kota Indonesia?',
      difficulty: 'BEGINNER',
      explanation: 'Jakarta adalah ibu kota Indonesia sejak kemerdekaan.',
      opsis: [
        { opsiText: 'Jakarta', isCorrect: true },
        { opsiText: 'Bandung', isCorrect: false },
        { opsiText: 'Surabaya', isCorrect: false },
        { opsiText: 'Medan', isCorrect: false }
      ]
    }
  }
};

async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': TEST_CONFIG.authToken
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`${method} ${endpoint}:`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('---');
    
    return { response, data };
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    return { error };
  }
}

async function runTests() {
  console.log('🧪 Starting Koleksi Soal API Tests');
  console.log('====================================\n');

  let createdKoleksiId = null;
  let createdSoalId = null;
  let createdOpsiId = null;

  try {
    // Test 1: Get all koleksi soal
    console.log('📋 Test 1: Get all koleksi soal');
    await makeRequest('/koleksi-soal');

    // Test 2: Create new koleksi soal
    console.log('📝 Test 2: Create new koleksi soal');
    const createKoleksiResult = await makeRequest('/koleksi-soal', 'POST', TEST_CONFIG.testData.koleksiSoal);
    if (createKoleksiResult.data?.success) {
      createdKoleksiId = createKoleksiResult.data.data.id;
      console.log(`✅ Created koleksi with ID: ${createdKoleksiId}`);
    }

    if (createdKoleksiId) {
      // Test 3: Get specific koleksi soal
      console.log('📖 Test 3: Get specific koleksi soal');
      await makeRequest(`/koleksi-soal/${createdKoleksiId}`);

      // Test 4: Create soal in koleksi
      console.log('📝 Test 4: Create soal in koleksi');
      const createSoalResult = await makeRequest(`/koleksi-soal/${createdKoleksiId}/soal`, 'POST', TEST_CONFIG.testData.soal);
      if (createSoalResult.data?.success) {
        createdSoalId = createSoalResult.data.data.id;
        console.log(`✅ Created soal with ID: ${createdSoalId}`);
      }

      // Test 5: Get soals in koleksi
      console.log('📋 Test 5: Get soals in koleksi');
      await makeRequest(`/koleksi-soal/${createdKoleksiId}/soal`);

      if (createdSoalId) {
        // Test 6: Get specific soal
        console.log('📖 Test 6: Get specific soal');
        await makeRequest(`/soal/${createdSoalId}`);

        // Test 7: Update soal
        console.log('📝 Test 7: Update soal');
        await makeRequest(`/soal/${createdSoalId}`, 'PATCH', {
          pertanyaan: 'Apa ibu kota Indonesia? (Updated)',
          explanation: 'Jakarta adalah ibu kota Indonesia sejak kemerdekaan. (Updated)'
        });

        // Test 8: Add additional opsi to soal
        console.log('📝 Test 8: Add additional opsi to soal');
        const createOpsiResult = await makeRequest(`/soal/${createdSoalId}/opsi`, 'POST', {
          opsiText: 'Yogyakarta',
          isCorrect: false
        });
        if (createOpsiResult.data?.success) {
          createdOpsiId = createOpsiResult.data.data.id;
          console.log(`✅ Created opsi with ID: ${createdOpsiId}`);
        }

        if (createdOpsiId) {
          // Test 9: Update opsi
          console.log('📝 Test 9: Update opsi');
          await makeRequest(`/opsi/${createdOpsiId}`, 'PATCH', {
            opsiText: 'Yogyakarta (Updated)',
            isCorrect: false
          });
        }
      }

      // Test 10: Update koleksi soal
      console.log('📝 Test 10: Update koleksi soal');
      await makeRequest(`/koleksi-soal/${createdKoleksiId}`, 'PATCH', {
        nama: 'Test Koleksi Soal (Updated)',
        deskripsi: 'Koleksi soal untuk testing API (Updated)'
      });
    }

    // Cleanup (optional - comment out if you want to keep test data)
    console.log('🧹 Cleanup: Deleting test data...');
    
    if (createdOpsiId) {
      console.log('🗑️ Deleting test opsi');
      await makeRequest(`/opsi/${createdOpsiId}`, 'DELETE');
    }
    
    if (createdSoalId) {
      console.log('🗑️ Deleting test soal');
      await makeRequest(`/soal/${createdSoalId}`, 'DELETE');
    }
    
    if (createdKoleksiId) {
      console.log('🗑️ Deleting test koleksi');
      await makeRequest(`/koleksi-soal/${createdKoleksiId}`, 'DELETE');
    }

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Instructions for running the test
console.log('📋 Instructions:');
console.log('1. Make sure your development server is running on localhost:3000');
console.log('2. Replace TEST_CONFIG.authToken with a valid JWT token');
console.log('3. Run this script with: node test-koleksi-soal-api.js');
console.log('');

// Uncomment the line below to run tests automatically
// runTests();

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, makeRequest, TEST_CONFIG };
}
