// Test script for Courses API to check JSON and HTML descriptions

// Check if we need to get the base URL from config
const API_BASE_URL = 'https://pejuangkorea.vercel.app';
const API_BASE = `${API_BASE_URL}/api/mobile/courses`;

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

// Test getting all courses
async function testGetCourses() {
  try {
    console.log('\n=== Testing GET /api/mobile/courses ===');
    const response = await fetch(API_BASE);
    const data = await handleResponse(response, 'GET Courses');
    
    if (data && data.success && data.data) {
      console.log(`\nFound ${data.data.length} courses`);
      
      // Check each course for JSON/HTML descriptions
      data.data.forEach((course, index) => {
        console.log(`\n--- Course ${index + 1}: ${course.title} ---`);
        console.log('Description:', course.description);
        console.log('JSON Description:', course.jsonDescription);
        console.log('HTML Description:', course.htmlDescription);
        
        if (course.jsonDescription) {
          try {
            const parsed = JSON.parse(course.jsonDescription);
            console.log('Parsed JSON Description:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Error parsing JSON description:', e.message);
          }
        }
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error testing courses endpoint:', error);
    return null;
  }
}

// Test getting a specific course
async function testGetCourse(courseId) {
  try {
    console.log(`\n=== Testing GET /api/mobile/courses/${courseId} ===`);
    const response = await fetch(`${API_BASE}/${courseId}`);
    const data = await handleResponse(response, `GET Course ${courseId}`);
    
    if (data && data.success && data.data) {
      const course = data.data;
      console.log(`\n--- Course Details: ${course.title} ---`);
      console.log('Description:', course.description);
      console.log('JSON Description:', course.jsonDescription);
      console.log('HTML Description:', course.htmlDescription);
      
      if (course.jsonDescription) {
        try {
          const parsed = JSON.parse(course.jsonDescription);
          console.log('Parsed JSON Description:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('Error parsing JSON description:', e.message);
        }
      }
      
      if (course.modules) {
        console.log(`\nModules (${course.modules.length}):`);
        course.modules.forEach((module, index) => {
          console.log(`  ${index + 1}. ${module.title}`);
          console.log(`     Description: ${module.description}`);
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error testing course ${courseId} endpoint:`, error);
    return null;
  }
}

// Test available courses endpoint
async function testGetAvailableCourses() {
  try {
    console.log('\n=== Testing GET /api/mobile/courses?available=true ===');
    const response = await fetch(`${API_BASE}?available=true`);
    return await handleResponse(response, 'GET Available Courses');
  } catch (error) {
    console.error('Error testing available courses endpoint:', error);
    return null;
  }
}

// Run the tests in sequence
async function runCourseTests() {
  console.log('🚀 Starting Courses API Tests...');
  
  // Test getting all courses
  const coursesData = await testGetCourses();
  
  // Test getting available courses
  await testGetAvailableCourses();
  
  // If we have courses, test getting the first one
  if (coursesData && coursesData.success && coursesData.data && coursesData.data.length > 0) {
    const firstCourseId = coursesData.data[0].id;
    await testGetCourse(firstCourseId);
  }
  
  console.log('\n✅ Course API tests completed!');
}

// Run all tests
runCourseTests().catch(console.error);
