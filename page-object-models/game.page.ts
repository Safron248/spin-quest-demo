import { Page, Locator } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly spinButton: Locator;
  readonly balance: Locator;
  readonly result: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinButton = page.getByRole('button', { name: /spin/i });
    this.balance = page.getByTestId('balance');
    this.result = page.getByTestId('spin-result');
  }

}