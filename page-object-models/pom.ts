import { Page } from '@playwright/test';
import { HomePage } from './home.page';
import { LandingPage } from './landing.page';
import { GamePage } from './game.page';

/**
 * Page Object Manager.
 *
 * Instantiating this single class instantiates every page object at once,
 * all sharing the same Playwright `Page`. Access each page through the manager:
 *
 *   const pom = new PageObjectManager(page);
 *   await pom.landing.goto();
 *   await pom.landing.openSite({ email, password });
 *   await pom.game.spinButton.click();
 */
export class PageObjectManager {
  readonly page: Page;
  readonly home: HomePage;
  readonly landing: LandingPage;
  readonly game: GamePage;

  constructor(page: Page) {
    this.page = page;
    this.home = new HomePage(page);
    this.landing = new LandingPage(page);
    this.game = new GamePage(page);
  }
}

/** Backwards-compatible aliases. */
export { PageObjectManager as POM, PageObjectManager as POManager };
export { HomePage, LandingPage, GamePage };
