import { test as base } from '@playwright/test';
import { PageObjectManager } from '../page-object-models/pom';

/** Fixtures provided on top of the built-in Playwright fixtures. */
type POMFixtures = {
  /**
   * Page Object Manager bound to the test's `page`. Use this instead of the
   * raw `page` fixture to reach every page object:
   *
   *   test('login', async ({ pom }) => {
   *     await pom.landing.goto();
   *     await pom.landing.openSite({ email, password });
   *   });
   */
  pom: PageObjectManager;
};

export const test = base.extend<POMFixtures>({
  pom: async ({ page }, use) => {
    await use(new PageObjectManager(page));
  },
});

export { expect } from '@playwright/test';
