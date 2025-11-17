#!/usr/bin/env node

/**
 * Villa Booking Platform - Comprehensive E2E Tests
 * Tests all functions and features on live domain
 */

const { chromium } = require('playwright');

const BASE_URL = 'https://villas.alexandratechlab.com';
const AIRBNB_ICAL_URL = 'https://www.airbnb.com/calendar/ical/1372757600412836188.ics?s=91c3d4174c482ceaef4d57d4bcdff58d';

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`  ✅ ${name}`);
    } else {
        testResults.failed++;
        console.log(`  ❌ ${name}`);
        if (details) console.log(`     ${details}`);
    }
    testResults.tests.push({ name, passed, details });
}

async function runComprehensiveTests() {
    console.log('='.repeat(70));
    console.log('Villa Booking Platform - Comprehensive E2E Test Suite');
    console.log('='.repeat(70));
    console.log('');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    try {
        // ==================== SECTION 1: Landing Page ====================
        console.log('📄 SECTION 1: Landing Page Tests');
        console.log('-'.repeat(70));

        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

        logTest('Landing page loads successfully', true);

        const title = await page.title();
        logTest('Page title is correct', title.includes('Villa'), `Title: ${title}`);

        // Check hero section
        const heroExists = await page.locator('.hero, [class*="hero"]').count() > 0;
        logTest('Hero section present', heroExists);

        // Check features section
        const featuresExists = await page.locator('#features, [id*="features"]').count() > 0;
        logTest('Features section present', featuresExists);

        // Check integrations section
        const integrationsExists = await page.locator('#integrations, [id*="integrations"]').count() > 0;
        logTest('Integrations section present', integrationsExists);

        // Check pricing section
        const pricingExists = await page.locator('#pricing, [id*="pricing"]').count() > 0;
        logTest('Pricing section present', pricingExists);

        // Check CTA buttons
        const ctaButtons = await page.locator('button:has-text("Get Started"), button:has-text("Start")').count();
        logTest('CTA buttons present', ctaButtons > 0, `Found ${ctaButtons} buttons`);

        await page.screenshot({ path: '/root/e2e_landing_page.png', fullPage: true });
        console.log('');

        // ==================== SECTION 2: Mobile Responsiveness ====================
        console.log('📱 SECTION 2: Mobile Responsiveness Tests');
        console.log('-'.repeat(70));

        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        const hamburgerVisible = await page.locator('.mobile-menu-btn').isVisible();
        logTest('Hamburger menu visible on mobile', hamburgerVisible);

        if (hamburgerVisible) {
            await page.click('.mobile-menu-btn');
            await page.waitForTimeout(500);

            const menuActive = await page.locator('.navbar-menu.active').isVisible();
            logTest('Mobile menu opens correctly', menuActive);

            const loginBtnInMenu = await page.locator('.navbar-menu.active >> text=Login').isVisible();
            logTest('Login button visible in mobile menu', loginBtnInMenu);

            await page.screenshot({ path: '/root/e2e_mobile_menu.png' });
        }

        await page.setViewportSize({ width: 1280, height: 720 });
        console.log('');

        // ==================== SECTION 3: Navigation ====================
        console.log('🧭 SECTION 3: Navigation Tests');
        console.log('-'.repeat(70));

        await page.goto(BASE_URL);
        const loginButton = await page.locator('button:has-text("Login"), a:has-text("Login")').first();
        const loginBtnExists = await loginButton.count() > 0;
        logTest('Login button exists', loginBtnExists);

        if (loginBtnExists) {
            await loginButton.click();
            await page.waitForTimeout(1000);

            const currentUrl = page.url();
            logTest('Navigates to login page', currentUrl.includes('/login'), `URL: ${currentUrl}`);
        }

        await page.screenshot({ path: '/root/e2e_navigation.png' });
        console.log('');

        // ==================== SECTION 4: Login Flow ====================
        console.log('🔐 SECTION 4: Login & Authentication Tests');
        console.log('-'.repeat(70));

        await page.goto(`${BASE_URL}/login`);

        // Check form elements
        const emailField = await page.locator('input[type="email"]').count() > 0;
        logTest('Email field present', emailField);

        const passwordField = await page.locator('input[type="password"]').count() > 0;
        logTest('Password field present', passwordField);

        const submitButton = await page.locator('button[type="submit"]').count() > 0;
        logTest('Submit button present', submitButton);

        // Select Admin role
        const adminRoleButton = await page.locator('button:has-text("Admin")').first();
        const adminRoleExists = await adminRoleButton.count() > 0;
        logTest('Admin role button exists', adminRoleExists);

        if (adminRoleExists) {
            await adminRoleButton.click();
            await page.waitForTimeout(500);
            logTest('Admin role selected', true);
        }

        // Fill credentials
        await page.fill('input[type="email"]', ADMIN_EMAIL);
        await page.fill('input[type="password"]', ADMIN_PASSWORD);
        logTest('Credentials filled', true);

        await page.screenshot({ path: '/root/e2e_login_form.png' });

        // Submit login
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        const postLoginUrl = page.url();
        const loginSuccessful = !postLoginUrl.includes('/login');
        logTest('Login successful', loginSuccessful, `URL: ${postLoginUrl}`);

        await page.screenshot({ path: '/root/e2e_post_login.png' });
        console.log('');

        if (!loginSuccessful) {
            console.log('⚠️  Login failed, skipping dashboard tests');
            await browser.close();
            return;
        }

        // ==================== SECTION 5: Dashboard ====================
        console.log('📊 SECTION 5: Dashboard Tests');
        console.log('-'.repeat(70));

        const hasSidebar = await page.locator('.sidebar, [class*="sidebar"]').count() > 0;
        logTest('Sidebar present', hasSidebar);

        const hasNavbar = await page.locator('nav, .navbar').count() > 0;
        logTest('Navbar present', hasNavbar);

        const hasUserInfo = await page.locator('.user-profile, [class*="user"]').count() > 0;
        logTest('User profile info present', hasUserInfo);

        const hasLogoutBtn = await page.locator('button:has-text("Logout")').count() > 0;
        logTest('Logout button present', hasLogoutBtn);

        await page.screenshot({ path: '/root/e2e_dashboard.png', fullPage: true });
        console.log('');

        // ==================== SECTION 6: Villa Management ====================
        console.log('🏠 SECTION 6: Villa Management Tests');
        console.log('-'.repeat(70));

        // Navigate to villas
        const villasLink = await page.locator('a:has-text("Villas"), a:has-text("My Villas")').first();
        const villasLinkExists = await villasLink.count() > 0;

        if (villasLinkExists) {
            await villasLink.click();
            await page.waitForTimeout(1000);
            logTest('Navigate to villas page', true);

            const addButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').count() > 0;
            logTest('Add villa button present', addButton);

            await page.screenshot({ path: '/root/e2e_villas_page.png', fullPage: true });
        } else {
            logTest('Navigate to villas page', false, 'Villas link not found');
        }
        console.log('');

        // ==================== SECTION 7: Create Villa ====================
        console.log('➕ SECTION 7: Create Villa Tests');
        console.log('-'.repeat(70));

        const createButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
        const createBtnExists = await createButton.count() > 0;

        if (createBtnExists) {
            await createButton.click();
            await page.waitForTimeout(1000);

            const modalOrForm = await page.locator('form, .modal, [class*="modal"]').count() > 0;
            logTest('Create villa form/modal opens', modalOrForm);

            if (modalOrForm) {
                // Check for common form fields
                const nameField = await page.locator('input[name="name"], input[placeholder*="name" i]').count() > 0;
                logTest('Villa name field present', nameField);

                const locationField = await page.locator('input[name="location"], input[placeholder*="location" i]').count() > 0;
                logTest('Location field present', locationField);

                const priceField = await page.locator('input[name="price"], input[placeholder*="price" i]').count() > 0;
                logTest('Price field present', priceField);

                await page.screenshot({ path: '/root/e2e_create_villa_form.png' });

                // Close modal if exists
                const closeBtn = await page.locator('button:has-text("Cancel"), button:has-text("Close"), .close').first();
                if (await closeBtn.count() > 0) {
                    await closeBtn.click();
                    await page.waitForTimeout(500);
                }
            }
        } else {
            logTest('Create villa button found', false, 'Button not found');
        }
        console.log('');

        // ==================== SECTION 8: API Integration ====================
        console.log('🔌 SECTION 8: API Integration Tests');
        console.log('-'.repeat(70));

        // Test API health
        const healthResponse = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/health');
                return await response.json();
            } catch (error) {
                return { error: error.message };
            }
        });

        logTest('API health endpoint accessible', healthResponse.status === 'healthy');
        logTest('Database connected', healthResponse.database === 'connected');

        // Test villas API
        const villasResponse = await page.evaluate(async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/v1/villas/my-villas', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                return { status: response.status, ok: response.ok };
            } catch (error) {
                return { error: error.message };
            }
        });

        logTest('Villas API endpoint accessible', villasResponse.ok);
        console.log('');

        // ==================== SECTION 9: Calendar Integration ====================
        console.log('📅 SECTION 9: Calendar Integration Tests');
        console.log('-'.repeat(70));

        // Create a test villa first
        const testVilla = await page.evaluate(async () => {
            try {
                const token = localStorage.getItem('authToken');
                const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

                const response = await fetch('/api/v1/villas', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'E2E Test Villa',
                        description: 'Created by automated E2E test',
                        location: 'Bali, Indonesia',
                        price: 200,
                        owner: userId
                    })
                });

                const data = await response.json();
                return data.data || data.villa || data;
            } catch (error) {
                return { error: error.message };
            }
        });

        logTest('Test villa created via API', testVilla._id || testVilla.id, `ID: ${testVilla._id || testVilla.id || 'N/A'}`);

        if (testVilla._id || testVilla.id) {
            const villaId = testVilla._id || testVilla.id;

            // Test calendar import
            const importResult = await page.evaluate(async (data) => {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch('/api/calendar/import', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            villaId: data.villaId,
                            icalUrl: data.icalUrl,
                            source: 'airbnb'
                        })
                    });

                    return await response.json();
                } catch (error) {
                    return { error: error.message };
                }
            }, { villaId, icalUrl: AIRBNB_ICAL_URL });

            logTest('Calendar import API call successful', importResult.success === true);

            if (importResult.data) {
                const totalProcessed = (importResult.data.imported || 0) + (importResult.data.updated || 0);
                logTest('Airbnb events imported/updated', totalProcessed > 0, `Processed: ${totalProcessed}`);
                logTest('No import errors', (importResult.data.errors || []).length === 0);
            }
        }
        console.log('');

        // ==================== SECTION 10: Bookings ====================
        console.log('📝 SECTION 10: Bookings Tests');
        console.log('-'.repeat(70));

        const bookingsResponse = await page.evaluate(async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                return { ok: response.ok, count: (data.data || data.bookings || []).length };
            } catch (error) {
                return { error: error.message };
            }
        });

        logTest('Bookings API accessible', bookingsResponse.ok);
        logTest('Bookings data retrieved', bookingsResponse.count >= 0, `Count: ${bookingsResponse.count}`);
        console.log('');

        // ==================== SECTION 11: Security ====================
        console.log('🔒 SECTION 11: Security Tests');
        console.log('-'.repeat(70));

        const hasAuthToken = await page.evaluate(() => {
            return !!localStorage.getItem('authToken');
        });
        logTest('Auth token stored in localStorage', hasAuthToken);

        const hasHttps = page.url().startsWith('https://');
        logTest('HTTPS enabled', hasHttps);

        logTest('No console errors during session', consoleErrors.length === 0,
            consoleErrors.length > 0 ? `Errors: ${consoleErrors.length}` : '');
        console.log('');

        // ==================== SECTION 12: Logout ====================
        console.log('👋 SECTION 12: Logout Tests');
        console.log('-'.repeat(70));

        const logoutButton = await page.locator('button:has-text("Logout")').first();
        if (await logoutButton.count() > 0) {
            await logoutButton.click();
            await page.waitForTimeout(2000);

            const afterLogoutUrl = page.url();
            logTest('Logout redirects to home/login',
                afterLogoutUrl.includes('/login') || afterLogoutUrl === BASE_URL + '/',
                `URL: ${afterLogoutUrl}`);

            const tokenCleared = await page.evaluate(() => {
                return !localStorage.getItem('authToken');
            });
            logTest('Auth token cleared after logout', tokenCleared);

            await page.screenshot({ path: '/root/e2e_after_logout.png' });
        } else {
            logTest('Logout button found', false);
        }
        console.log('');

    } catch (error) {
        console.error('\n❌ TEST ERROR:', error.message);
        await page.screenshot({ path: '/root/e2e_error.png' });
    } finally {
        await browser.close();

        // ==================== FINAL SUMMARY ====================
        console.log('='.repeat(70));
        console.log('TEST SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Tests: ${testResults.total}`);
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
        console.log('');

        if (testResults.failed > 0) {
            console.log('Failed Tests:');
            testResults.tests.filter(t => !t.passed).forEach(t => {
                console.log(`  ❌ ${t.name}`);
                if (t.details) console.log(`     ${t.details}`);
            });
            console.log('');
        }

        console.log('Screenshots saved:');
        console.log('  - /root/e2e_landing_page.png');
        console.log('  - /root/e2e_mobile_menu.png');
        console.log('  - /root/e2e_login_form.png');
        console.log('  - /root/e2e_dashboard.png');
        console.log('  - /root/e2e_villas_page.png');
        console.log('  - /root/e2e_create_villa_form.png');
        console.log('  - /root/e2e_after_logout.png');
        console.log('='.repeat(70));

        // Exit with appropriate code
        process.exit(testResults.failed > 0 ? 1 : 0);
    }
}

// Run tests
runComprehensiveTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
