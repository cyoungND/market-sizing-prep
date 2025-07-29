// Debug API responses
const API_BASE = 'http://localhost:3001/api';

async function debugAPI() {
  console.log('🔍 Debugging API responses...\n');

  try {
    // Register and get token
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'debug@example.com',
        password: 'password123',
        name: 'Debug User'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', JSON.stringify(registerData, null, 2));
    
    if (!registerData.token) {
      console.log('No token in register response, trying login...');
      
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'debug@example.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response:', JSON.stringify(loginData, null, 2));
      
      if (loginData.token) {
        console.log('\n🔍 Testing questions with token...');
        const questionsResponse = await fetch(`${API_BASE}/questions`, {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        
        const questionsData = await questionsResponse.json();
        console.log('Questions response:', JSON.stringify(questionsData, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugAPI();
