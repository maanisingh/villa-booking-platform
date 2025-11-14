const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://villas.alexandratechlab.com';
const FRONTEND_URL = 'https://villas.alexandratechlab.com'; // Update with Netlify URL when deployed

// Test data
const testOwnerEmail = `testowner_${Date.now()}@villa.com`;
const testOwnerPassword = 'TestPassword123!';
const testOwnerName = 'E2E Test Owner';

test.describe('Villa Booking Platform - Comprehensive E2E Tests', () => {

  test.describe('Issue 1: Owner Registration', () => {
    test('should register new owner successfully', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/register`);

      // Fill registration form
      await page.fill('input[name="name"]', testOwnerName);
      await page.fill('input[name="email"]', testOwnerEmail);
      await page.fill('input[name="phoneNumber"]', '+1234567890');
      await page.fill('input[name="password"]', testOwnerPassword);
      await page.fill('input[name="confirmPassword"]', testOwnerPassword);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success message
      await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/register`);

      // Try to register with existing email
      await page.fill('input[name="name"]', 'Another Owner');
      await page.fill('input[name="email"]', testOwnerEmail);
      await page.fill('input[name="phoneNumber"]', '+9876543210');
      await page.fill('input[name="password"]', testOwnerPassword);
      await page.fill('input[name="confirmPassword"]', testOwnerPassword);

      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=/already exists/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Issue 2 & 3: Admin Dashboard & Stats', () => {
    test('should login as admin successfully', async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Click admin quick login
      await page.click('text=Admin Login');

      // Should auto-fill credentials
      await expect(page.locator('input[type="email"]')).toHaveValue('admin@gmail.com');

      // Submit login
      await page.click('button[type="submit"]:has-text("Sign In")');

      // Wait for dashboard
      await expect(page).toHaveURL(/.*admin-dashboard/, { timeout: 10000 });
    });

    test('should load villa stats without 500 error', async ({ page }) => {
      // Login as admin first
      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      // Wait for dashboard
      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });

      // Check that stats are loaded (no 500 error)
      await expect(page.locator('text=/Total.*Villa/i')).toBeVisible({ timeout: 10000 });

      // Check console for errors
      const logs = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      // Verify no 500 errors
      const has500Error = logs.some(log => log.includes('500'));
      expect(has500Error).toBe(false);
    });

    test('should display villa list', async ({ page }) => {
      // Login as admin
      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });

      // Navigate to villas section if needed
      const villasLink = page.locator('text=Villas').first();
      if (await villasLink.isVisible()) {
        await villasLink.click();
      }

      // Should see villa table or cards
      await expect(page.locator('table, [class*="card"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Issue 4: Owner Login & LocalStorage ID', () => {
    let ownerId;

    test('should login owner and save ID to localStorage', async ({ page, context }) => {
      await page.goto(FRONTEND_URL);

      // Select Owner role
      await page.click('text=Owner');

      // Fill credentials (use previously created test owner)
      await page.fill('input[type="email"]', testOwnerEmail);
      await page.fill('input[type="password"]', testOwnerPassword);

      // Submit
      await page.click('button[type="submit"]:has-text("Sign In")');

      // Wait for redirect to owner dashboard
      await expect(page).toHaveURL(/.*owner-dashboard/, { timeout: 10000 });

      // Check localStorage
      const localStorage = await page.evaluate(() => {
        return {
          userRole: localStorage.getItem('userRole'),
          ownerId: localStorage.getItem('ownerId'),
          user: localStorage.getItem('user'),
          authToken: localStorage.getItem('authToken')
        };
      });

      // Verify all required fields are saved
      expect(localStorage.userRole).toBe('Owner');
      expect(localStorage.ownerId).toBeTruthy();
      expect(localStorage.ownerId).not.toBe('undefined');
      expect(localStorage.ownerId).not.toBe('null');
      expect(localStorage.user).toBeTruthy();
      expect(localStorage.authToken).toBeTruthy();

      // Parse and verify user object
      const userObj = JSON.parse(localStorage.user);
      expect(userObj.id).toBeTruthy();
      expect(userObj.id).toBe(localStorage.ownerId);
      expect(userObj.email).toBe(testOwnerEmail);

      ownerId = localStorage.ownerId;
    });

    test('should persist owner ID after page refresh', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.click('text=Owner');
      await page.fill('input[type="email"]', testOwnerEmail);
      await page.fill('input[type="password"]', testOwnerPassword);
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*owner-dashboard/, { timeout: 10000 });

      // Get owner ID before refresh
      const ownerIdBefore = await page.evaluate(() => localStorage.getItem('ownerId'));

      // Refresh page
      await page.reload();

      // Get owner ID after refresh
      const ownerIdAfter = await page.evaluate(() => localStorage.getItem('ownerId'));

      // Should be the same
      expect(ownerIdBefore).toBe(ownerIdAfter);
      expect(ownerIdAfter).not.toBe('undefined');
    });
  });

  test.describe('Issue 5: Owner Panel "My Villas"', () => {
    test('should access My Villas without "undefined" in URL', async ({ page }) => {
      // Login as owner
      await page.goto(FRONTEND_URL);
      await page.click('text=Owner');
      await page.fill('input[type="email"]', testOwnerEmail);
      await page.fill('input[type="password"]', testOwnerPassword);
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*owner-dashboard/, { timeout: 10000 });

      // Navigate to My Villas
      const myVillasLink = page.locator('text=/My Villa/i').first();
      await myVillasLink.click({ timeout: 10000 });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Check network requests
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/api')) {
          requests.push(request.url());
        }
      });

      await page.waitForTimeout(3000);

      // Verify no requests have "undefined" in them
      const hasUndefined = requests.some(url => url.includes('undefined'));
      expect(hasUndefined).toBe(false);

      // Verify API call uses actual owner ID
      const ownerId = await page.evaluate(() => localStorage.getItem('ownerId'));
      const hasCorrectId = requests.some(url => url.includes(ownerId));
      expect(hasCorrectId).toBe(true);
    });

    test('should show empty state or villas for new owner', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.click('text=Owner');
      await page.fill('input[type="email"]', testOwnerEmail);
      await page.fill('input[type="password"]', testOwnerPassword);
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*owner-dashboard/, { timeout: 10000 });

      const myVillasLink = page.locator('text=/My Villa/i').first();
      await myVillasLink.click({ timeout: 10000 });

      // Should show either empty state message OR villa list
      await expect(
        page.locator('text=/No villas|villa/i').first()
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Issue 6: Villa Integrations Dropdown', () => {
    test('should populate villa dropdown in integrations', async ({ page }) => {
      // Login as admin
      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });

      // Navigate to Villa Integrations (may be under different menu)
      const integrationLink = page.locator('text=/Integration/i').first();
      if (await integrationLink.isVisible({ timeout: 5000 })) {
        await integrationLink.click();

        // Look for add/connect button
        const addButton = page.locator('button:has-text("Add"), button:has-text("Connect")').first();
        if (await addButton.isVisible({ timeout: 5000 })) {
          await addButton.click();

          // Wait for modal
          await page.waitForTimeout(1000);

          // Check villa dropdown/select
          const villaSelect = page.locator('select[name*="villa"], select:has-text("Villa")').first();
          if (await villaSelect.isVisible({ timeout: 3000 })) {
            // Get options
            const options = await villaSelect.locator('option').allTextContents();

            // Should have at least one villa option (besides placeholder)
            expect(options.length).toBeGreaterThan(1);
          }
        }
      }
    });
  });

  test.describe('Additional Critical Tests', () => {
    test('should handle admin_id without ObjectId errors', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });

      // Monitor console for MongoDB ObjectId errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('ObjectId')) {
          errors.push(msg.text());
        }
      });

      // Navigate around dashboard
      await page.waitForTimeout(3000);

      // Should have no ObjectId errors
      expect(errors.length).toBe(0);
    });

    test('should create villa successfully', async ({ page }) => {
      // Login as admin
      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });

      // Try to navigate to add villa
      const addVillaBtn = page.locator('button:has-text("Add Villa"), button:has-text("Create Villa")').first();
      if (await addVillaBtn.isVisible({ timeout: 5000 })) {
        await addVillaBtn.click();

        // Fill form (if modal appears)
        await page.waitForTimeout(1000);

        const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
        if (await nameInput.isVisible({ timeout: 3000 })) {
          await nameInput.fill('E2E Test Villa');
          await page.fill('input[name="location"], input[placeholder*="location"]', 'Test Location');
          await page.fill('input[name="price"], input[placeholder*="price"]', '500');

          const submitBtn = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Add")').first();
          await submitBtn.click();

          // Should see success message
          await expect(page.locator('text=/success|created/i')).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('should handle CORS correctly', async ({ page }) => {
      const corsErrors = [];

      page.on('console', msg => {
        if (msg.text().includes('CORS') || msg.text().includes('Access-Control')) {
          corsErrors.push(msg.text());
        }
      });

      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });
      await page.waitForTimeout(3000);

      // Should have no CORS errors
      expect(corsErrors.length).toBe(0);
    });
  });

  test.describe('Performance & Security Tests', () => {
    test('should load homepage within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should have security headers', async ({ page }) => {
      const response = await page.goto(FRONTEND_URL);
      const headers = response.headers();

      // Check for security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeTruthy();
    });

    test('should handle logout correctly', async ({ page }) => {
      // Login
      await page.goto(FRONTEND_URL);
      await page.click('text=Admin Login');
      await page.click('button[type="submit"]:has-text("Sign In")');

      await page.waitForURL(/.*admin-dashboard/, { timeout: 10000 });

      // Logout
      const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
      if (await logoutBtn.isVisible({ timeout: 5000 })) {
        await logoutBtn.click();

        // Should redirect to login
        await expect(page).toHaveURL(/.*login|^\/$/, { timeout: 5000 });

        // LocalStorage should be cleared
        const token = await page.evaluate(() => localStorage.getItem('authToken'));
        expect(token).toBeFalsy();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('should be responsive on mobile', async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Page should load
      await expect(page.locator('body')).toBeVisible();

      // Login form should be visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });
});
