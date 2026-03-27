import fetch from 'node-fetch';

console.log('🚀 COMPLETE SYSTEM TESTING');
console.log('========================\n');

const BACKEND_URL = 'http://localhost:5004';
const PROXY_URL = 'http://localhost:3002';
const FRONTEND_URL = 'http://localhost:3001';

const testResults = {
    backend: false,
    proxy: false,
    userCredentials: false,
    loginFlow: false
};

async function testBackendAPI() {
    console.log('🔧 TEST 1: Backend API Functionality');
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@yhk.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message}`);
        
        if (data.success && data.token) {
            console.log('   ✅ Backend API working correctly');
            testResults.backend = true;
        } else {
            console.log('   ❌ Backend API not working');
        }
    } catch (error) {
        console.log(`   ❌ Backend API error: ${error.message}`);
    }
    console.log('');
}

async function testProxyServer() {
    console.log('🔧 TEST 2: Proxy Server Connectivity');
    try {
        const response = await fetch(`${PROXY_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@yhk.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message}`);
        
        if (data.success && data.token) {
            console.log('   ✅ Proxy server working correctly');
            testResults.proxy = true;
        } else {
            console.log('   ❌ Proxy server not working');
        }
    } catch (error) {
        console.log(`   ❌ Proxy server error: ${error.message}`);
    }
    console.log('');
}

async function testUserCredentials() {
    console.log('🔧 TEST 3: User Login Credentials');
    try {
        const response = await fetch(`${PROXY_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'sumitkhekare@gmail.com',
                password: 'sumit123'
            })
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message}`);
        console.log(`   User: ${data.user?.name || 'N/A'}`);
        console.log(`   Role: ${data.user?.role || 'N/A'}`);
        
        if (data.success && data.token && data.user) {
            console.log('   ✅ User credentials working correctly');
            testResults.userCredentials = true;
        } else {
            console.log('   ❌ User credentials not working');
        }
    } catch (error) {
        console.log(`   ❌ User credentials error: ${error.message}`);
    }
    console.log('');
}

async function testCompleteLoginFlow() {
    console.log('🔧 TEST 4: Complete Login Flow');
    try {
        // Step 1: Login
        const loginResponse = await fetch(`${PROXY_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'sumitkhekare@gmail.com',
                password: 'sumit123'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            console.log('   ❌ Login step failed');
            return;
        }
        
        console.log('   ✅ Step 1: Login successful');
        
        // Step 2: Test token validation
        const meResponse = await fetch(`${PROXY_URL}/api/auth/me`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const meData = await meResponse.json();
        console.log(`   Token validation status: ${meResponse.status}`);
        console.log(`   Token validation success: ${meData.success}`);
        
        if (meData.success) {
            console.log('   ✅ Step 2: Token validation successful');
            console.log('   ✅ Complete login flow working correctly');
            testResults.loginFlow = true;
        } else {
            console.log('   ❌ Token validation failed');
        }
        
    } catch (error) {
        console.log(`   ❌ Complete login flow error: ${error.message}`);
    }
    console.log('');
}

async function generateFinalReport() {
    console.log('📊 FINAL TEST REPORT');
    console.log('===================');
    console.log(`✅ Backend API: ${testResults.backend ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Proxy Server: ${testResults.proxy ? 'PASS' : 'FAIL'}`);
    console.log(`✅ User Credentials: ${testResults.userCredentials ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Complete Login Flow: ${testResults.loginFlow ? 'PASS' : 'FAIL'}`);
    
    const allTestsPassed = Object.values(testResults).every(result => result === true);
    console.log(`\n🎯 OVERALL STATUS: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allTestsPassed) {
        console.log('\n🎉 SYSTEM READY FOR LOGIN!');
        console.log('🌐 Access the application at: http://localhost:3001');
        console.log('🔐 Use credentials:');
        console.log('   📧 Email: sumitkhekare@gmail.com');
        console.log('   🔒 Password: sumit123');
        console.log('\n✨ You should now be able to login successfully!');
    } else {
        console.log('\n❌ System not ready. Please check failed tests.');
    }
}

async function runAllTests() {
    await testBackendAPI();
    await testProxyServer();
    await testUserCredentials();
    await testCompleteLoginFlow();
    await generateFinalReport();
}

runAllTests();
