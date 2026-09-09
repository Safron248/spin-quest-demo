import { Page, Locator, expect } from '@playwright/test';

export interface OpenSiteOptions {
  email: string;
  password: string;
  /** Site to open. Defaults to the production site. */
  url?: string;
  /** Submit the form after filling it. Defaults to true. */
  submit?: boolean;
}

export class LandingPage {
  static readonly SITE_URL = 'https://spinquest.com/';

  readonly page: Page;
  readonly openLoginButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly turnstileFrame: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openLoginButton = page.getByRole('button', { name: 'LOGIN' });
    this.usernameInput = page.getByRole('textbox', { name: 'Enter email or username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.locator('form').getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
    this.turnstileFrame = page.locator('iframe[src*="challenges.cloudflare.com"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Open the login form from the home page. */
  async open() {
    await this.openLoginButton.click();
    await expect(this.usernameInput).toBeVisible();
  }

  /** Solve the Cloudflare Turnstile checkbox challenge, if one is shown. */
  async solveTurnstile() {
    if (await this.turnstileFrame.isVisible().catch(() => false)) {
      await this.turnstileFrame.contentFrame().locator('body').click();
    }
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.solveTurnstile();
    await this.submitButton.click();
  }

  /** Open the form and log in from the home page in one step. */
  async openAndLogin(username: string, password: string) {
    await this.open();
    await this.login(username, password);
  }

  /**
   * Parametrized "open site" flow: navigate to the site, open the login form,
   * fill the given credentials, solve Turnstile, and (optionally) submit.
   */
  async openSite(options: OpenSiteOptions) {
    const { email, password, url = LandingPage.SITE_URL, submit = true } = options;

    await this.page.goto(url);
    await this.page.waitForLoadState();

    await this.open();
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.solveTurnstile();

    if (submit) {
      await this.submitButton.click();
    }
  }

  async expectLoaded() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectError(message?: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    if (message !== undefined) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectLoggedIn() {
    await expect(this.openLoginButton).toBeHidden();
    await expect(this.errorMessage).toBeHidden();
  }
}
