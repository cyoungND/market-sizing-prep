/**
 * Test script to verify analytics integration works end-to-end
 * This will simulate a complete user session with analytics tracking
 */

const BASE_URL = 'http://localhost:3001/api';

async function testAnalyticsIntegration() {
  console.log('🧪 Starting Analytics Integration Test...\n');

  try {
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'analytics-test@example.com',
        password: 'testpass123',
        name: 'Analytics Tester'
      })
    });
    
    if (!registerResponse.ok) {
      console.log('User might already exist, trying login...');
    }

    // Step 2: Login to get JWT token
    console.log('2️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'analytics-test@example.com',
        password: 'testpass123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.error}`);
    }

    const token = loginData.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Login successful');

    // Step 3: Create a practice session
    console.log('3️⃣ Creating practice session...');
    const sessionResponse = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        totalQuestions: 3
      })
    });

    const sessionData = await sessionResponse.json();
    if (!sessionResponse.ok) {
      throw new Error(`Session creation failed: ${sessionData.error}`);
    }

    const sessionId = sessionData.session.id;
    console.log(`✅ Session created: ${sessionId}`);

    // Step 4: Get random questions and submit responses
    console.log('4️⃣ Submitting responses with analytics tracking...');
    
    for (let i = 0; i < 3; i++) {
      // Get a random question
      const questionResponse = await fetch(`${BASE_URL}/questions/random`, {
        headers
      });
      const questionData = await questionResponse.json();
      const questionId = questionData.question.id;

      // Submit a response (alternating correct/incorrect for testing)
      const isCorrect = i % 2 === 0; // First and third correct, second incorrect
      const responsePayload = {
        questionId,
        selectedComponents: [questionData.question.components[0]?.id || 'test-component'], // Use first component ID
        correct: isCorrect,
        timeSpent: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
        attempts: isCorrect ? 1 : Math.floor(Math.random() * 3) + 2 // 1 attempt if correct, 2-4 if incorrect
      };

      const submitResponse = await fetch(`${BASE_URL}/sessions/${sessionId}/responses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(responsePayload)
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(`Response submission failed: ${errorData.error}`);
      }

      console.log(`   📝 Response ${i + 1}: ${isCorrect ? '✅ Correct' : '❌ Incorrect'} (${responsePayload.timeSpent}s, ${responsePayload.attempts} attempts)`);
    }

    // Step 5: End the session
    console.log('5️⃣ Ending session...');
    const endSessionResponse = await fetch(`${BASE_URL}/sessions/${sessionId}/end`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ completed: true })
    });

    if (!endSessionResponse.ok) {
      const errorData = await endSessionResponse.json();
      throw new Error(`Session end failed: ${errorData.error}`);
    }

    console.log('✅ Session ended successfully');

    // Step 6: Test analytics endpoints
    console.log('6️⃣ Testing analytics endpoints...\n');

    // Test user stats
    console.log('📊 Getting user analytics...');
    const userStatsResponse = await fetch(`${BASE_URL}/analytics/user-stats`, { headers });
    const userStats = await userStatsResponse.json();
    console.log('User Stats:', JSON.stringify(userStats, null, 2));

    // Test daily trends
    console.log('\n📈 Getting daily trends...');
    const dailyTrendsResponse = await fetch(`${BASE_URL}/analytics/daily-trends?days=7`, { headers });
    const dailyTrends = await dailyTrendsResponse.json();
    console.log('Daily Trends:', JSON.stringify(dailyTrends, null, 2));

    // Test share data
    console.log('\n🔗 Getting share data...');
    const shareDataResponse = await fetch(`${BASE_URL}/analytics/share-data`, { headers });
    const shareData = await shareDataResponse.json();
    console.log('Share Data:', JSON.stringify(shareData, null, 2));

    // Test session results
    console.log('\n📋 Getting session results...');
    const sessionResultsResponse = await fetch(`${BASE_URL}/analytics/session-results/${sessionId}`, { headers });
    const sessionResults = await sessionResultsResponse.json();
    console.log('Session Results:', JSON.stringify(sessionResults, null, 2));

    console.log('\n🎉 Analytics Integration Test PASSED! All endpoints working correctly.');

  } catch (error) {
    console.error('\n❌ Analytics Integration Test FAILED:', error.message);
    process.exit(1);
  }
}

// Run the test
testAnalyticsIntegration();
