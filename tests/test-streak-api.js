const BASE_URL = 'http://192.168.1.5:3000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function testStreakAPI() {
  try {
    console.log('🔥 Testing Streak API...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/mobile/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Token:', loginData.token ? 'Present' : 'Missing');
    
    const token = loginData.token;
    if (!token) {
      throw new Error('No token received from login');
    }

    // 2. Get current streak data
    console.log('\n2. Getting current streak data...');
    const streakResponse = await fetch(`${BASE_URL}/api/mobile/streak`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!streakResponse.ok) {
      const errorText = await streakResponse.text();
      throw new Error(`Streak fetch failed: ${streakResponse.status} - ${errorText}`);
    }

    const streakData = await streakResponse.json();
    console.log('✅ Streak data retrieved');
    console.log('Current streak:', streakData.data.currentStreak);
    console.log('Max streak:', streakData.data.maxStreak);
    console.log('XP:', streakData.data.xp);
    console.log('Level:', streakData.data.level);
    console.log('Streak status:', streakData.data.streakStatus);

    // 3. Record a new activity
    console.log('\n3. Recording a new activity...');
    const activityResponse = await fetch(`${BASE_URL}/api/mobile/streak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'COMPLETE_MODULE',
        description: 'Completed a Korean language module',
        xpEarned: 50,
        metadata: {
          moduleId: 1,
          courseName: 'Basic Korean'
        }
      }),
    });

    if (!activityResponse.ok) {
      const errorText = await activityResponse.text();
      throw new Error(`Activity recording failed: ${activityResponse.status} - ${errorText}`);
    }

    const activityData = await activityResponse.json();
    console.log('✅ Activity recorded');
    console.log('Streak update:', activityData.data.streak);
    console.log('XP update:', activityData.data.xp);
    console.log('Level update:', activityData.data.level);
    console.log('Message:', activityData.message);

    // 4. Get updated streak data
    console.log('\n4. Getting updated streak data...');
    const updatedStreakResponse = await fetch(`${BASE_URL}/api/mobile/streak`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!updatedStreakResponse.ok) {
      const errorText = await updatedStreakResponse.text();
      throw new Error(`Updated streak fetch failed: ${updatedStreakResponse.status} - ${errorText}`);
    }

    const updatedStreakData = await updatedStreakResponse.json();
    console.log('✅ Updated streak data retrieved');
    console.log('New current streak:', updatedStreakData.data.currentStreak);
    console.log('New max streak:', updatedStreakData.data.maxStreak);
    console.log('New XP:', updatedStreakData.data.xp);
    console.log('New Level:', updatedStreakData.data.level);
    console.log('Recent activities count:', updatedStreakData.data.recentActivities.length);

    console.log('\n🎉 All streak API tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStreakAPI();
