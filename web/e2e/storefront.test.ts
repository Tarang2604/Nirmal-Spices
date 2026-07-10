import { test, expect } from '@playwright/test';

test.describe('Storefront E2E Tests', () => {
  test('should navigate to the homepage and verify branding', async ({ page }) => {
    // Navigate to homepage local server
    await page.goto('http://localhost:3000/');

    // Expect page title to contain Nirmal's Spices
    await expect(page).toHaveTitle(/Nirmal's Spices/);

    // Verify main CTA button is visible
    const exploreBtn = page.getByRole('link', { name: 'Explore Spices' });
    await expect(exploreBtn).toBeVisible();
  });

  test('should navigate to the shop page and display products grid', async ({ page }) => {
    await page.goto('http://localhost:3000/shop');

    // Expect shop title heading is displayed
    const heading = page.getByRole('heading', { name: 'Spice Store' });
    await expect(heading).toBeVisible();

    // Verify filters sidebar is loaded
    const filtersLabel = page.getByText('Filters');
    await expect(filtersLabel).toBeVisible();
  });

  test('should block unauthorized users from account pages', async ({ page }) => {
    await page.goto('http://localhost:3000/account');

    // Expect redirect to login page
    await expect(page).toHaveURL(/.*login.*/);
  });
});
