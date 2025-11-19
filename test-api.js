/**
 * Simple API test script
 * Tests the API endpoints without authentication for demonstration
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing VPN Panel API\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Status: ${health.statusCode}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test 2: Get API info
    console.log('2. Testing API info endpoint...');
    const apiInfo = await makeRequest('GET', '/api/vpn');
    console.log(`   Status: ${apiInfo.statusCode}`);
    console.log(`   Response: ${JSON.stringify(apiInfo.data, null, 2)}\n`);

    // Test 3: List menus (will fail without auth but shows validation)
    console.log('3. Testing list menus endpoint (without auth)...');
    const menus = await makeRequest('GET', '/api/menus');
    console.log(`   Status: ${menus.statusCode}`);
    console.log(`   Response: ${JSON.stringify(menus.data, null, 2)}\n`);

    // Test 4: List VPN users (will fail without auth)
    console.log('4. Testing list VPN users endpoint (without auth)...');
    const users = await makeRequest('GET', '/api/vpn/users');
    console.log(`   Status: ${users.statusCode}`);
    console.log(`   Response: ${JSON.stringify(users.data, null, 2)}\n`);

    // Test 5: Get system info (will fail without auth)
    console.log('5. Testing system info endpoint (without auth)...');
    const sysInfo = await makeRequest('GET', '/api/system/info');
    console.log(`   Status: ${sysInfo.statusCode}`);
    console.log(`   Response: ${JSON.stringify(sysInfo.data, null, 2)}\n`);

    // Test 6: Create user with invalid data (validation test)
    console.log('6. Testing create user validation (invalid data)...');
    const createUser = await makeRequest('POST', '/api/vpn/users', {
      username: 'ab', // Too short
      protocol: 'invalid',
      expiry_days: 500, // Too many
    });
    console.log(`   Status: ${createUser.statusCode}`);
    console.log(`   Response: ${JSON.stringify(createUser.data, null, 2)}\n`);

    console.log('✅ All tests completed!');
    console.log('\n📚 API Documentation: http://localhost:3000/api-docs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for server to be ready
setTimeout(() => {
  runTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}, 1000);
