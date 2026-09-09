import { Page } from '@playwright/test';
import { HomePage } from './home.page';
import { LandingPage } from './landing.page';
import { GamePage } from './game.page';

/**
 * Aggregate entry point for all page object models.
 * Instantiate once per test and access each page through it.
 *
 *   const pom = new POM(page);
 *   await pom.home.goto();
 *   await pom.landing.login('user', 'pass');
 */
export class POM {
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

export { HomePage, LandingPage, GamePage };
