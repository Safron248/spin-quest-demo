import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly loginButton: Locator;
  readonly playButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.loginButton = page.getByRole('button', { name: /log in/i });
    this.playButton = page.getByRole('button', { name: /play/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async openLogin() {
    await this.loginButton.click();
  }

  async startPlaying() {
    await this.playButton.click();
  }
}
