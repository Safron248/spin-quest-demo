import { test } from '@playwright/test';
import { LandingPage } from '../page-object-models/landing.page';

const VALID_USER = process.env.TEST_USER ?? 'testuser@gmail.com';
const VALID_PASSWORD = process.env.TEST_PASSWORD ?? 'testpassword';

test.describe('Landing page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.goto();
    await landingPage.open();
    await landingPage.expectLoaded();
  });

  test('logs in with valid credentials', async () => {
    await landingPage.login(VALID_USER, VALID_PASSWORD);
    await landingPage.expectLoggedIn();
  });

  test('shows an error for a wrong password', async () => {
    await landingPage.login(VALID_USER, 'not-the-password');
    await landingPage.expectError(/invalid|incorrect/i);
  });

  test('rejects empty credentials', async () => {
    await landingPage.login('', '');
    await landingPage.expectError();
  });
});

test('open site', async ({ page }) => {
  const landingPage = new LandingPage(page);
  await landingPage.openSite({ email: 'test@test.com', password: 'password@password' });
});
