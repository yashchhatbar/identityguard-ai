import { test, expect } from '@playwright/test';

test.describe('IdentityGuard AI Frontend E2E', () => {

    test('should load the homepage and check core navigation', async ({ page }) => {
        // Navigate to local Vite dev server (or CI running bound)
        await page.goto('http://localhost:5173');

        // Check Core brand text
        await expect(page.locator('text=IdentityGuard AI').first()).toBeVisible();

        // Check navigation options exist
        const verifyLink = page.locator('text=Verify Identity').first();
        const registerLink = page.locator('text=Register Face').first();

        await expect(verifyLink).toBeVisible();
        await expect(registerLink).toBeVisible();
    });

    test('should load the admin login page', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/login');

        // Admin login header rendered by DOM
        const loginHeader = page.locator('h2:has-text("Admin access")');
        await expect(loginHeader).toBeVisible();

        // Form fields exist
        await expect(page.locator('input[placeholder="admin"]')).toBeVisible();
        await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();
    });

});
