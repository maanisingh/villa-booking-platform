/**
 * Platform Integration Test Script
 *
 * This script tests all platform integration functionality
 * Run with: node test-platform-integration.js
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_USER_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

// Test data
const testPlatforms = {
  airbnb: {
    apiKey: 'test_airbnb_key',
    apiSecret: 'test_airbnb_secret',
    accessToken: 'test_airbnb_token',
    refreshToken: 'test_airbnb_refresh'
  },
  booking_com: {
    partnerId: 'test_partner_123',
    apiKey: 'test_booking_key',
    hotelId: 'test_hotel_456'
  },
  vrbo: {
    apiKey: 'test_vrbo_key',
    apiSecret: 'test_vrbo_secret',
    partnerId: 'test_vrbo_partner',
    accessToken: 'test_vrbo_token',
    refreshToken: 'test_vrbo_refresh'
  },
  expedia: {
    username: 'test_expedia_user',
    password: 'test_expedia_pass',
    hotelId: 'test_expedia_hotel',
    apiKey: 'test_expedia_key',
    secret: 'test_expedia_secret'
  }
};

// Axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TEST_USER_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Helper function to log results
function logResult(testName, success, details = '') {
  const symbol = success ? '' : '';
  const color = success ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${symbol}\x1b[0m ${testName}${details ? `: ${details}` : ''}`);
}

// Test Functions
async function testPlatformConnection(platform) {
  try {
    const response = await api.post('/api/platforms/test-connection', {
      platform,
      credentials: testPlatforms[platform]
    });

    logResult(
      `Test ${platform} connection`,
      response.data.success,
      response.data.message
    );

    return response.data.success;
  } catch (error) {
    logResult(
      `Test ${platform} connection`,
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

async function connectPlatform(platform) {
  try {
    const response = await api.post('/api/platforms/connect', {
      platform,
      credentials: testPlatforms[platform],
      syncFrequency: 2,
      autoSync: true
    });

    logResult(
      `Connect to ${platform}`,
      response.data.success,
      response.data.message
    );

    return response.data.data;
  } catch (error) {
    logResult(
      `Connect to ${platform}`,
      false,
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function getAllIntegrations() {
  try {
    const response = await api.get('/api/platforms');

    logResult(
      'Get all integrations',
      response.data.success,
      `Found ${response.data.count} integrations`
    );

    return response.data.data;
  } catch (error) {
    logResult(
      'Get all integrations',
      false,
      error.response?.data?.message || error.message
    );
    return [];
  }
}

async function syncPlatform(platform) {
  try {
    console.log(`\nStarting sync for ${platform}...`);

    const response = await api.post(`/api/platforms/${platform}/sync`);

    const syncData = response.data.data;
    console.log(`  New bookings: ${syncData.newBookings}`);
    console.log(`  Updated bookings: ${syncData.updatedBookings}`);
    console.log(`  Errors: ${syncData.errorCount}`);
    console.log(`  Duration: ${syncData.duration}ms`);

    logResult(
      `Sync ${platform}`,
      response.data.success && syncData.status === 'success',
      syncData.status
    );

    return syncData;
  } catch (error) {
    logResult(
      `Sync ${platform}`,
      false,
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function syncAllPlatforms() {
  try {
    console.log('\nSyncing all platforms...');

    const response = await api.post('/api/platforms/sync-all');

    const summary = response.data.data;
    console.log(`  Total platforms: ${summary.totalPlatforms}`);
    console.log(`  Successful: ${summary.successful}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  New bookings: ${summary.totalNewBookings}`);
    console.log(`  Updated bookings: ${summary.totalUpdatedBookings}`);

    logResult(
      'Sync all platforms',
      response.data.success,
      `${summary.successful}/${summary.totalPlatforms} successful`
    );

    return summary;
  } catch (error) {
    logResult(
      'Sync all platforms',
      false,
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function getSyncHistory() {
  try {
    const response = await api.get('/api/sync/history?limit=5');

    logResult(
      'Get sync history',
      response.data.success,
      `Found ${response.data.data.total} sync logs`
    );

    if (response.data.data.logs.length > 0) {
      console.log('\n  Recent sync logs:');
      response.data.data.logs.forEach(log => {
        console.log(`    - ${log.platform}: ${log.status} (${new Date(log.createdAt).toLocaleString()})`);
      });
    }

    return response.data.data;
  } catch (error) {
    logResult(
      'Get sync history',
      false,
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function getSyncStatistics() {
  try {
    const response = await api.get('/api/sync/statistics');

    const stats = response.data.data;

    logResult(
      'Get sync statistics',
      response.data.success,
      `${stats.activeIntegrations} active integrations`
    );

    console.log('\n  Statistics:');
    console.log(`    Total integrations: ${stats.totalIntegrations}`);
    console.log(`    Active integrations: ${stats.activeIntegrations}`);
    console.log(`    Total syncs: ${stats.totalSyncs}`);
    console.log(`    Successful syncs: ${stats.successfulSyncs}`);
    console.log(`    Failed syncs: ${stats.failedSyncs}`);
    console.log(`    Total bookings synced: ${stats.totalBookingsSynced}`);

    return stats;
  } catch (error) {
    logResult(
      'Get sync statistics',
      false,
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function testCalendarExport(villaId) {
  try {
    const response = await api.get(`/api/calendar/export/${villaId}`);

    const isICal = response.data.includes('BEGIN:VCALENDAR');

    logResult(
      'Export calendar to iCal',
      isICal,
      isICal ? 'Valid iCal format' : 'Invalid format'
    );

    return response.data;
  } catch (error) {
    logResult(
      'Export calendar to iCal',
      false,
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function disconnectPlatform(integrationId, platform) {
  try {
    const response = await api.delete(`/api/platforms/${integrationId}`);

    logResult(
      `Disconnect ${platform}`,
      response.data.success,
      response.data.message
    );

    return response.data.success;
  } catch (error) {
    logResult(
      `Disconnect ${platform}`,
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('====================================');
  console.log('Platform Integration Test Suite');
  console.log('====================================\n');

  console.log('1. Testing Platform Connections');
  console.log('--------------------------------');

  // Test connections
  for (const platform of Object.keys(testPlatforms)) {
    await testPlatformConnection(platform);
  }

  console.log('\n2. Connecting to Platforms');
  console.log('--------------------------------');

  // Connect to platforms
  const connectedPlatforms = [];
  for (const platform of Object.keys(testPlatforms)) {
    const integration = await connectPlatform(platform);
    if (integration) {
      connectedPlatforms.push({ platform, id: integration._id });
    }
  }

  console.log('\n3. Fetching Integration List');
  console.log('--------------------------------');

  await getAllIntegrations();

  console.log('\n4. Testing Sync Operations');
  console.log('--------------------------------');

  // Test individual platform sync
  if (connectedPlatforms.length > 0) {
    await syncPlatform(connectedPlatforms[0].platform);
  }

  // Test sync all
  await syncAllPlatforms();

  console.log('\n5. Testing Sync History & Statistics');
  console.log('--------------------------------');

  await getSyncHistory();
  await getSyncStatistics();

  console.log('\n6. Testing Calendar Operations');
  console.log('--------------------------------');

  // Note: You'll need a valid villa ID for this test
  // await testCalendarExport('villa_id_here');

  console.log('\n7. Cleaning Up - Disconnecting Platforms');
  console.log('--------------------------------');

  // Disconnect all platforms
  for (const { id, platform } of connectedPlatforms) {
    await disconnectPlatform(id, platform);
  }

  console.log('\n====================================');
  console.log('Test Suite Complete');
  console.log('====================================');
}

// Error handler
process.on('unhandledRejection', (error) => {
  console.error('\n Unhandled error:', error.message);
  process.exit(1);
});

// Check for auth token
if (TEST_USER_TOKEN === 'your-test-token-here') {
  console.error('   Please set a valid TEST_TOKEN environment variable');
  console.log('   You can get a token by logging in through the API');
  console.log('   Example: TEST_TOKEN=your_token node test-platform-integration.js');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('\n Test suite failed:', error.message);
  process.exit(1);
});