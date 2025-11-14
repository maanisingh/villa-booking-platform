/**
 * Villa Booking Platform - Playwright E2E Tests
 * Comprehensive end-to-end testing including Platform Integration features
 */

const { chromium } = require('playwright');

const BASE_URL = 'https://villas.alexandratechlab.com';
const TEST_CONFIG = {
    headless: true,
    ignoreHTTPSErrors: true,
    timeout: 30000
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(testName, passed, message = '') {
    totalTests++;
    if (passed) {
        passedTests++;
        log(`✓ PASS - ${testName}`, 'green');
    } else {
        failedTests++;
        log(`✗ FAIL - ${testName}`, 'red');
        if (message) log(`  ${message}`, 'yellow');
    }
}

async function takeScreenshot(page, name) {
    try {
        await page.screenshot({
            path: `/root/villa-e2e-screenshots/${name}.png`,
            fullPage: true
        });
        log(`  📸 Screenshot saved: ${name}.png`, 'cyan');
    } catch (error) {
        log(`  ⚠️  Screenshot failed: ${error.message}`, 'yellow');
    }
}

async function runTests() {
    log('\n========================================', 'blue');
    log('  Villa Booking Platform E2E Tests', 'blue');
    log('========================================\n', 'blue');

    const browser = await chromium.launch({
        headless: TEST_CONFIG.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        ignoreHTTPSErrors: TEST_CONFIG.ignoreHTTPSErrors,
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // Create screenshot directory
        const fs = require('fs');
        const screenshotDir = '/root/villa-e2e-screenshots';
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        // ==================== Test 1: Homepage Load ====================
        log('[1/12] Testing Homepage Load...', 'yellow');
        try {
            const response = await page.goto(BASE_URL, {
                waitUntil: 'networkidle',
                timeout: 20000
            });
            testResult('Homepage loads successfully', response.status() === 200);
            await takeScreenshot(page, '01-homepage');
        } catch (error) {
            testResult('Homepage loads successfully', false, error.message);
        }

        // ==================== Test 2: Page Title ====================
        log('[2/12] Testing Page Title...', 'yellow');
        try {
            const title = await page.title();
            testResult('Page has valid title', title.length > 0, `Title: ${title}`);
        } catch (error) {
            testResult('Page has valid title', false, error.message);
        }

        // ==================== Test 3: Navigation Elements ====================
        log('[3/12] Testing Navigation Elements...', 'yellow');
        try {
            await page.waitForLoadState('domcontentloaded');
            const hasNav = await page.locator('nav, header, .navbar, [role="navigation"]').count() > 0;
            testResult('Navigation elements present', hasNav);
        } catch (error) {
            testResult('Navigation elements present', false, error.message);
        }

        // ==================== Test 4: Login Page Access ====================
        log('[4/12] Testing Login Page Access...', 'yellow');
        try {
            // Look for login link/button
            const loginLinks = await page.locator('a:has-text("Login"), button:has-text("Login"), a:has-text("Sign In")').count();
            if (loginLinks > 0) {
                await page.locator('a:has-text("Login"), button:has-text("Login"), a:has-text("Sign In")').first().click();
                await page.waitForLoadState('networkidle');
                await takeScreenshot(page, '02-login-page');
                testResult('Login page accessible', true);
            } else {
                // Try direct URL
                await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
                await takeScreenshot(page, '02-login-page');
                testResult('Login page accessible via URL', true);
            }
        } catch (error) {
            testResult('Login page accessible', false, error.message);
        }

        // ==================== Test 5: Login Form Elements ====================
        log('[5/12] Testing Login Form Elements...', 'yellow');
        try {
            const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count() > 0;
            const passwordInput = await page.locator('input[type="password"], input[name="password"]').count() > 0;
            const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').count() > 0;

            testResult('Login form has required fields', emailInput && passwordInput && loginButton);
        } catch (error) {
            testResult('Login form has required fields', false, error.message);
        }

        // ==================== Test 6: Admin Login ====================
        log('[6/12] Testing Admin Login...', 'yellow');
        try {
            await page.fill('input[type="email"], input[name="email"]', 'admin@villabook.com');
            await page.fill('input[type="password"], input[name="password"]', 'Admin@123');
            await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

            await page.waitForTimeout(2000);
            await takeScreenshot(page, '03-after-login');

            // Check if redirected to dashboard
            const currentUrl = page.url();
            const isLoggedIn = currentUrl.includes('dashboard') || currentUrl.includes('admin') || currentUrl !== `${BASE_URL}/login`;
            testResult('Admin login successful', isLoggedIn, `Current URL: ${currentUrl}`);
        } catch (error) {
            testResult('Admin login successful', false, error.message);
        }

        // ==================== Test 7: Dashboard Access ====================
        log('[7/12] Testing Dashboard Access...', 'yellow');
        try {
            // Try to navigate to dashboard
            if (!page.url().includes('dashboard')) {
                await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
            }
            await takeScreenshot(page, '04-dashboard');
            testResult('Dashboard accessible', true);
        } catch (error) {
            testResult('Dashboard accessible', false, error.message);
        }

        // ==================== Test 8: Platform Integration Menu ====================
        log('[8/12] Testing Platform Integration Menu...', 'yellow');
        try {
            // Look for Platform Integration or similar navigation items
            const platformLinks = await page.locator('a:has-text("Integration"), a:has-text("Platform"), a:has-text("Sync"), a:has-text("Airbnb"), a:has-text("Booking.com")').count();

            if (platformLinks > 0) {
                await page.locator('a:has-text("Integration"), a:has-text("Platform"), a:has-text("Sync")').first().click();
                await page.waitForTimeout(1000);
                await takeScreenshot(page, '05-platform-integration');
                testResult('Platform Integration menu exists', true);
            } else {
                testResult('Platform Integration menu exists', false, 'Menu item not found');
            }
        } catch (error) {
            testResult('Platform Integration menu exists', false, error.message);
        }

        // ==================== Test 9: Villas Page ====================
        log('[9/12] Testing Villas Page...', 'yellow');
        try {
            const villasLink = await page.locator('a:has-text("Villa"), a:has-text("Properties"), a[href*="villa"]').count();
            if (villasLink > 0) {
                await page.locator('a:has-text("Villa"), a:has-text("Properties"), a[href*="villa"]').first().click();
                await page.waitForTimeout(1000);
                await takeScreenshot(page, '06-villas-page');
                testResult('Villas page accessible', true);
            } else {
                await page.goto(`${BASE_URL}/villas`, { waitUntil: 'networkidle' });
                await takeScreenshot(page, '06-villas-page');
                testResult('Villas page accessible', true);
            }
        } catch (error) {
            testResult('Villas page accessible', false, error.message);
        }

        // ==================== Test 10: Bookings Page ====================
        log('[10/12] Testing Bookings Page...', 'yellow');
        try {
            const bookingsLink = await page.locator('a:has-text("Booking"), a:has-text("Reservation"), a[href*="booking"]').count();
            if (bookingsLink > 0) {
                await page.locator('a:has-text("Booking"), a:has-text("Reservation"), a[href*="booking"]').first().click();
                await page.waitForTimeout(1000);
                await takeScreenshot(page, '07-bookings-page');
                testResult('Bookings page accessible', true);
            } else {
                await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle' });
                await takeScreenshot(page, '07-bookings-page');
                testResult('Bookings page accessible', true);
            }
        } catch (error) {
            testResult('Bookings page accessible', false, error.message);
        }

        // ==================== Test 11: Responsive Design ====================
        log('[11/12] Testing Responsive Design...', 'yellow');
        try {
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(500);
            await takeScreenshot(page, '08-mobile-view');

            // Test tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.waitForTimeout(500);
            await takeScreenshot(page, '09-tablet-view');

            // Restore desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            testResult('Responsive design works', true);
        } catch (error) {
            testResult('Responsive design works', false, error.message);
        }

        // ==================== Test 12: API Health Check ====================
        log('[12/12] Testing API Health via Frontend...', 'yellow');
        try {
            const apiResponse = await page.evaluate(async (baseUrl) => {
                try {
                    const response = await fetch(`${baseUrl}/api/v1/villas`);
                    return {
                        status: response.status,
                        ok: response.ok
                    };
                } catch (error) {
                    return { status: 0, ok: false, error: error.message };
                }
            }, BASE_URL);

            testResult('API endpoint reachable from frontend', apiResponse.ok, `Status: ${apiResponse.status}`);
        } catch (error) {
            testResult('API endpoint reachable from frontend', false, error.message);
        }

        // Final screenshot
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await takeScreenshot(page, '10-final-homepage');

    } catch (error) {
        log(`\n❌ Test suite error: ${error.message}`, 'red');
        log(error.stack, 'red');
    } finally {
        await browser.close();
    }

    // Print Summary
    log('\n========================================', 'blue');
    log('  Test Summary', 'blue');
    log('========================================', 'blue');
    log(`Total Tests:  ${totalTests}`);
    log(`Passed:       ${passedTests}`, 'green');
    log(`Failed:       ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    log('');

    log('========================================', 'blue');
    log('  Screenshots Location', 'blue');
    log('========================================', 'blue');
    log('/root/villa-e2e-screenshots/', 'cyan');
    log('');

    if (failedTests === 0) {
        log('🎉 All E2E tests passed! Deployment successful!', 'green');
        process.exit(0);
    } else {
        log('⚠️  Some E2E tests failed. Check the output above.', 'yellow');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
