const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:9000/api';

// Test credentials from seed
const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '123',
  role: 'Admin'
};

const OWNER_CREDENTIALS = {
  email: 'testowner@villa.com',
  password: 'password123',
  role: 'Owner'
};

test.describe('Villa Booking Platform - Comprehensive Tests', () => {

  // ============================================
  // 1. ADMIN LOGIN & DASHBOARD TESTS
  // ============================================
  test('Admin Login - Should login successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Select Admin role
    await page.click('text=Admin');

    // Fill credentials
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin-dashboard', { timeout: 10000 });

    // Verify we're on admin dashboard
    expect(page.url()).toContain('/admin-dashboard');

    // Take screenshot
    await page.screenshot({ path: 'test-results/01-admin-login-success.png', fullPage: true });
  });

  test('Admin Dashboard - Display stats and data', async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Admin');
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin-dashboard');

    // Wait for dashboard to load
    await page.waitForTimeout(2000);

    // Check for dashboard elements
    const hasStats = await page.locator('text=/Total|Available|Owners/i').count();
    expect(hasStats).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/02-admin-dashboard.png', fullPage: true });
  });

  test('Admin - View All Villas', async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Admin');
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin-dashboard');

    // Navigate to villas section
    await page.click('text=/Villas|All Villas/i');
    await page.waitForTimeout(2000);

    // Verify villas are displayed
    const villaElements = await page.locator('[class*="villa"], [class*="card"]').count();
    expect(villaElements).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/03-admin-villas.png', fullPage: true });
  });

  test('Admin - View All Owners', async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Admin');
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin-dashboard');

    // Navigate to owners section
    await page.click('text=/Owners|All Owners/i');
    await page.waitForTimeout(2000);

    // Verify owners are displayed
    const ownerElements = await page.locator('text=/testowner|Owner/i').count();
    expect(ownerElements).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/04-admin-owners.png', fullPage: true });
  });

  test('Admin - Create New Villa', async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Admin');
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin-dashboard');

    // Navigate to villas
    await page.click('text=/Villas|All Villas/i');
    await page.waitForTimeout(1000);

    // Look for Add/Create Villa button
    const createButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);

      // Fill villa details
      await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test Villa from Playwright');
      await page.fill('input[name="location"], input[placeholder*="location" i]', 'Bali, Indonesia');
      await page.fill('input[name="price"], input[placeholder*="price" i]', '500');

      await page.screenshot({ path: 'test-results/05-admin-create-villa-form.png', fullPage: true });
    }
  });

  // ============================================
  // 2. OWNER LOGIN & DASHBOARD TESTS
  // ============================================
  test('Owner Login - Should login successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Select Owner role
    await page.click('text=Owner');

    // Fill credentials
    await page.fill('input[type="email"]', OWNER_CREDENTIALS.email);
    await page.fill('input[type="password"]', OWNER_CREDENTIALS.password);

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for navigation to owner dashboard
    await page.waitForURL('**/owner-dashboard', { timeout: 10000 });

    // Verify we're on owner dashboard
    expect(page.url()).toContain('/owner-dashboard');

    await page.screenshot({ path: 'test-results/06-owner-login-success.png', fullPage: true });
  });

  test('Owner Dashboard - View My Villas', async ({ page }) => {
    // Login as owner
    await page.goto(BASE_URL);
    await page.click('text=Owner');
    await page.fill('input[type="email"]', OWNER_CREDENTIALS.email);
    await page.fill('input[type="password"]', OWNER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/owner-dashboard');

    // Wait for dashboard to load
    await page.waitForTimeout(2000);

    // Navigate to My Villas section
    await page.click('text=/My Villa|My Properties/i').catch(() => {});
    await page.waitForTimeout(2000);

    // Verify villas are displayed
    const villaCount = await page.locator('text=/Villa|Property/i').count();
    expect(villaCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/07-owner-my-villas.png', fullPage: true });
  });

  test('Owner - View Bookings', async ({ page }) => {
    // Login as owner
    await page.goto(BASE_URL);
    await page.click('text=Owner');
    await page.fill('input[type="email"]', OWNER_CREDENTIALS.email);
    await page.fill('input[type="password"]', OWNER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/owner-dashboard');

    // Navigate to bookings
    await page.click('text=/Booking|My Bookings/i').catch(() => {});
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/08-owner-bookings.png', fullPage: true });
  });

  test('Owner - View Calendar', async ({ page }) => {
    // Login as owner
    await page.goto(BASE_URL);
    await page.click('text=Owner');
    await page.fill('input[type="email"]', OWNER_CREDENTIALS.email);
    await page.fill('input[type="password"]', OWNER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/owner-dashboard');

    // Navigate to calendar
    await page.click('text=/Calendar/i').catch(() => {});
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/09-owner-calendar.png', fullPage: true });
  });

  test('Owner - Platform Integration Settings', async ({ page }) => {
    // Login as owner
    await page.goto(BASE_URL);
    await page.click('text=Owner');
    await page.fill('input[type="email"]', OWNER_CREDENTIALS.email);
    await page.fill('input[type="password"]', OWNER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/owner-dashboard');

    // Navigate to platform integration
    await page.click('text=/Platform|Integration|Settings/i').catch(() => {});
    await page.waitForTimeout(2000);

    // Check for platform options
    const hasPlatforms = await page.locator('text=/Airbnb|Booking.com|VRBO/i').count();

    await page.screenshot({ path: 'test-results/10-owner-platform-integration.png', fullPage: true });
  });

  // ============================================
  // 3. OWNER REGISTRATION TEST
  // ============================================
  test('New Owner Registration', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click register link
    await page.click('text=/Register|Sign Up|Create Account/i');
    await page.waitForTimeout(1000);

    // Fill registration form
    const randomEmail = `newowner${Date.now()}@test.com`;
    await page.fill('input[name="name"], input[placeholder*="name" i]', 'New Test Owner');
    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[name="phoneNumber"], input[placeholder*="phone" i]', '+1234567890');
    await page.fill('input[name="password"]:not([name="confirmPassword"])', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    await page.screenshot({ path: 'test-results/11-owner-registration-form.png', fullPage: true });

    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/12-owner-registration-result.png', fullPage: true });
  });

  // ============================================
  // 4. API ENDPOINT TESTS
  // ============================================
  test('API - Health Check', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('API - Admin Login Endpoint', async ({ request }) => {
    const response = await request.post(`${API_URL}/admin/login`, {
      data: ADMIN_CREDENTIALS
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
  });

  test('API - Owner Login Endpoint', async ({ request }) => {
    const response = await request.post(`${API_URL}/owner/login`, {
      data: OWNER_CREDENTIALS
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
  });

  test('API - Get All Villas', async ({ request }) => {
    const response = await request.get(`${API_URL}/villas`);
    expect(response.ok()).toBeTruthy();
    const villas = await response.json();
    expect(Array.isArray(villas)).toBe(true);
    expect(villas.length).toBeGreaterThan(0);
  });

  test('API - Get Villa Stats', async ({ request }) => {
    const response = await request.get(`${API_URL}/villas/stats`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
  });

  // ============================================
  // 5. NAVIGATION & UI TESTS
  // ============================================
  test('Quick Login Buttons Work', async ({ page }) => {
    await page.goto(BASE_URL);

    // Test Admin Quick Login button
    await page.click('button:has-text("Admin Login")');
    await page.waitForTimeout(500);

    // Verify credentials are filled
    const emailValue = await page.inputValue('input[type="email"]');
    expect(emailValue).toBe(ADMIN_CREDENTIALS.email);

    await page.screenshot({ path: 'test-results/13-quick-login-admin.png', fullPage: true });

    // Test Owner Quick Login button
    await page.click('button:has-text("Owner Login")');
    await page.waitForTimeout(500);

    const ownerEmailValue = await page.inputValue('input[type="email"]');
    expect(ownerEmailValue).toBe(OWNER_CREDENTIALS.email);

    await page.screenshot({ path: 'test-results/14-quick-login-owner.png', fullPage: true });
  });

  test('Logout Functionality', async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL);
    await page.click('text=Admin');
    await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin-dashboard');

    // Look for logout button
    await page.click('text=/Logout|Sign Out/i').catch(() => {
      console.log('Logout button not found in standard location');
    });

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/15-after-logout.png', fullPage: true });
  });

});
