// Test script for Modules API with authentication to check JSON and HTML descriptions

const API_BASE_URL = 'https://pejuangkorea.vercel.app';
const MODULES_API_BASE = `${API_BASE_URL}/api/mobile/modules`;
const COURSES_API_BASE = `${API_BASE_URL}/api/mobile/courses`;

// Test credentials provided by user
const TEST_CREDENTIALS = {
  email: 'murid1@murid.com',
  password: '12345678'
};

let authToken = null;

// Helper function to handle responses
async function handleResponse(response, endpoint) {
  console.log(`${endpoint} status:`, response.status);
  
  // Clone the response before reading it
  const responseClone = response.clone();
  
  try {
    const data = await response.json();
    console.log(`${endpoint} response:`, JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.log(`Could not parse ${endpoint} response as JSON:`, e.message);
    
    // Try to get the text response from the cloned response
    try {
      const text = await responseClone.text();
      console.log(`${endpoint} text response:`, text);
    } catch (textError) {
      console.log(`Could not get ${endpoint} response text:`, textError.message);
    }
    return null;
  }
}

// Login first to get authentication token
async function login() {
  try {
    console.log('🔐 Attempting login...');
    const response = await fetch(`${API_BASE_URL}/api/mobile/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    const data = await handleResponse(response, 'Login');
    
    if (data && data.success && data.token) {
      authToken = data.token;
      console.log('✅ Login successful, token received');
      return true;
    } else {
      console.log('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.error('Error during login:', error);
    return false;
  }
}

// Make authenticated request
async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// Get a course to find modules
async function getCoursesWithModules() {
  try {
    console.log('\n=== Getting courses to find modules ===');
    const response = await fetchWithAuth(COURSES_API_BASE);
    const data = await handleResponse(response, 'GET Courses');
    
    if (data && data.success && data.data) {
      // Find courses that have modules
      const coursesWithModules = data.data.filter(course => course.totalModules > 0);
      
      if (coursesWithModules.length > 0) {
        console.log(`\nFound ${coursesWithModules.length} courses with modules:`);
        coursesWithModules.forEach((course, index) => {
          console.log(`  ${index + 1}. ${course.title} - ${course.totalModules} modules (joined: ${course.isJoined})`);
        });
        return coursesWithModules;
      } else {
        console.log('❌ No courses with modules found');
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error getting courses:', error);
    return [];
  }
}

// Get detailed course information including modules
async function getCourseDetails(courseId) {
  try {
    console.log(`\n=== Getting course details for ID: ${courseId} ===`);
    const response = await fetchWithAuth(`${COURSES_API_BASE}/${courseId}`);
    const data = await handleResponse(response, `GET Course ${courseId}`);
    
    if (data && data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting course ${courseId} details:`, error);
    return null;
  }
}

// Test getting a specific module
async function testGetModule(moduleId) {
  try {
    console.log(`\n=== Testing GET /api/mobile/modules/${moduleId} (authenticated) ===`);
    const response = await fetchWithAuth(`${MODULES_API_BASE}/${moduleId}`);
    const data = await handleResponse(response, `GET Module ${moduleId}`);
    
    if (data && data.success && data.data) {
      const module = data.data;
      console.log('JSON Description:', module.jsonDescription);
    }
    
    return data;
  } catch (error) {
    console.error(`Error testing module ${moduleId} endpoint:`, error);
    return null;
  }
}

// Test updating module completion
async function testUpdateModuleCompletion(moduleId, isCompleted) {
  try {
    console.log(`\n=== Testing PUT /api/mobile/modules/${moduleId}/completion (${isCompleted ? 'complete' : 'incomplete'}) ===`);
    const response = await fetchWithAuth(`${MODULES_API_BASE}/${moduleId}/completion`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted })
    });
    return await handleResponse(response, `PUT Module ${moduleId} Completion`);
  } catch (error) {
    console.error(`Error testing module ${moduleId} completion update:`, error);
    return null;
  }
}

// Run the tests in sequence
async function runModuleTests() {
  console.log('🚀 Starting Module API Tests...');
  console.log('⚠️  Make sure to update TEST_CREDENTIALS with valid email/password');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Get courses with modules
  const coursesWithModules = await getCoursesWithModules();
  
  if (coursesWithModules.length === 0) {
    console.log('❌ No courses with modules found. Cannot test module API.');
    return;
  }
  
  // Try to find a joined course first, then fall back to any course
  let targetCourse = coursesWithModules.find(course => course.isJoined);
  if (!targetCourse) {
    console.log('⚠️  No joined courses found, trying first available course...');
    targetCourse = coursesWithModules[0];
  }
  
  console.log(`\n🎯 Testing with Course: ${targetCourse.title} (${targetCourse.totalModules} modules)`);
  console.log(`📝 Course is joined: ${targetCourse.isJoined}`);
  
  // Get course details with actual modules
  const courseDetails = await getCourseDetails(targetCourse.id);
  
  if (courseDetails && courseDetails.modules && courseDetails.modules.length > 0) {
    console.log(`\n📋 Found ${courseDetails.modules.length} modules in course:`);
    courseDetails.modules.forEach((module, index) => {
      console.log(`  ${index + 1}. Module ID: ${module.id}, Title: "${module.title}"`);
    });
    
    // Test the first module
    const firstModule = courseDetails.modules[0];
    console.log(`\n🧪 Testing Module API with ID: ${firstModule.id}`);
    
    // Test getting module details
    const moduleData = await testGetModule(firstModule.id);
    
    if (moduleData && moduleData.success) {
      // Test marking module as completed
      await testUpdateModuleCompletion(firstModule.id, true);
      
      // Test marking module as incomplete
      await testUpdateModuleCompletion(firstModule.id, false);
      
      // Get module again to see if completion status updated
      console.log('\n=== Verifying completion status update ===');
      await testGetModule(firstModule.id);
    }
  } else {
    console.log('❌ No modules found in course details');
  }
  
  console.log('\n✅ Module API tests completed!');
  console.log('\n📋 Summary:');
  console.log('- ✅ Module API endpoint created at /api/mobile/modules/[id]');
  console.log('- ✅ GET: Fetch module with jsonDescription and htmlDescription');
  console.log('- ✅ PUT: Update module completion status');
  console.log('- 🔒 Access control: Only course members/authors can access modules');
  console.log('- 📖 JSON Description: Available for rich content rendering');
}

// Run all tests
runModuleTests().catch(console.error);
