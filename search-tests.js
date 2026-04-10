// Automated test suite for search functionality
import { execSync } from 'child_process';
import fs from 'fs';

const BASE_URL = 'http://localhost:50017';

class SearchTestSuite {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async makeRequest(endpoint, method = 'GET') {
    try {
      const command = `curl -s "${BASE_URL}${endpoint}"`;
      const output = execSync(command, { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error.message);
      return null;
    }
  }

  async runTest(testName, endpoint, expectedResults, assertions = []) {
    console.log(`\n🧪 Running test: ${testName}`);
    
    const response = await this.makeRequest(endpoint);
    
    if (!response) {
      this.addTestResult(testName, false, 'Request failed');
      return false;
    }

    let testPassed = true;
    let failureReason = '';

    // Check if response has expected structure
    if (response.success === undefined) {
      testPassed = false;
      failureReason = 'Missing success field in response';
    }

    // Check expected results count
    if (expectedResults !== undefined && response.count !== expectedResults) {
      testPassed = false;
      failureReason = `Expected ${expectedResults} results, got ${response.count}`;
    }

    // Run custom assertions
    for (const assertion of assertions) {
      const assertionResult = assertion(response);
      if (!assertionResult.passed) {
        testPassed = false;
        failureReason = assertionResult.message;
        break;
      }
    }

    this.addTestResult(testName, testPassed, failureReason, response);
    return testPassed;
  }

  addTestResult(testName, passed, reason = '', response = null) {
    const result = {
      testName,
      passed,
      reason,
      response: response ? {
        success: response.success,
        count: response.count,
        dataLength: response.data ? response.data.length : 0
      } : null
    };

    this.testResults.push(result);
    
    if (passed) {
      this.passedTests++;
      console.log(`✅ ${testName} - PASSED`);
    } else {
      this.failedTests++;
      console.log(`❌ ${testName} - FAILED: ${reason}`);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Search Functionality Test Suite\n');

    // Test 1: Server Health Check
    await this.runTest(
      'Server Health Check',
      '/api/health',
      undefined,
      [
        (response) => ({
          passed: response.status === 'ok',
          message: `Expected status 'ok', got '${response.status}'`
        })
      ]
    );

    // Test 2: Empty Search Query
    await this.runTest(
      'Empty Search Query',
      '/api/search?q=',
      0,
      [
        (response) => ({
          passed: response.success === true && Array.isArray(response.data),
          message: 'Expected success=true and data array'
        })
      ]
    );

    // Test 3: Search for Known Items - Burger
    await this.runTest(
      'Search for Burger',
      '/api/search?q=burger',
      2,
      [
        (response) => ({
          passed: response.data.length > 0 && response.data[0].name.toLowerCase().includes('burger'),
          message: 'Expected burger items in results'
        })
      ]
    );

    // Test 4: Search for Known Items - Biryani
    await this.runTest(
      'Search for Biryani',
      '/api/search?q=biryani',
      5,
      [
        (response) => ({
          passed: response.data.length > 0 && response.data.every(item => 
            item.name.toLowerCase().includes('biryani')
          ),
          message: 'Expected all results to contain biryani'
        })
      ]
    );

    // Test 5: Search for Known Items - Ragi
    await this.runTest(
      'Search for Ragi',
      '/api/search?q=ragi',
      3,
      [
        (response) => ({
          passed: response.data.length > 0,
          message: 'Expected ragi items in results'
        })
      ]
    );

    // Test 6: Case Insensitive Search
    await this.runTest(
      'Case Insensitive Search',
      '/api/search?q=BIRYANI',
      5,
      [
        (response) => ({
          passed: response.count > 0,
          message: 'Expected case insensitive search to work'
        })
      ]
    );

    // Test 7: Partial Match Search
    await this.runTest(
      'Partial Match Search',
      '/api/search?q=bir',
      5,
      [
        (response) => ({
          passed: response.count > 0,
          message: 'Expected partial matches to work'
        })
      ]
    );

    // Test 8: Special Characters Search
    await this.runTest(
      'Special Characters Search',
      '/api/search?q=!@#$%',
      0,
      [
        (response) => ({
          passed: response.success === true && response.count === 0,
          message: 'Expected no results for special characters'
        })
      ]
    );

    // Test 9: Non-existent Item Search
    await this.runTest(
      'Non-existent Item Search',
      '/api/search?q=xyz123nonexistent',
      0,
      [
        (response) => ({
          passed: response.success === true && response.count === 0,
          message: 'Expected no results for non-existent items'
        })
      ]
    );

    // Test 10: Single Character Search
    await this.runTest(
      'Single Character Search',
      '/api/search?q=a',
      undefined,
      [
        (response) => ({
          passed: response.success === true && response.count >= 0,
          message: 'Expected valid response for single character search'
        })
      ]
    );

    // Test 11: Get Popular Items
    await this.runTest(
      'Get Popular Items',
      '/api/popular-items',
      undefined,
      [
        (response) => ({
          passed: response.success === true && Array.isArray(response.data),
          message: 'Expected success=true and data array for popular items'
        })
      ]
    );

    // Test 12: Get Item by ID
    await this.runTest(
      'Get Item by ID',
      '/api/item/69c212c8c7fa23a6a8c36b59',
      undefined,
      [
        (response) => ({
          passed: response.success === true && response.data && response.data.name,
          message: 'Expected valid item data'
        })
      ]
    );

    // Test 13: Get Non-existent Item by ID
    await this.runTest(
      'Get Non-existent Item by ID',
      '/api/item/507f1f77bcf86cd799439011',
      undefined,
      [
        (response) => ({
          passed: response.success === false || response.status === 404,
          message: 'Expected error for non-existent item'
        })
      ]
    );

    this.printResults();
    this.saveResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.testName}: ${test.reason}`);
        });
    }
  }

  saveResults() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.passedTests,
        failed: this.failedTests,
        successRate: ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)
      },
      tests: this.testResults
    };

    fs.writeFileSync('search-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Test report saved to: search-test-report.json');
  }
}

// Run the test suite
const testSuite = new SearchTestSuite();
testSuite.runAllTests().catch(console.error);
