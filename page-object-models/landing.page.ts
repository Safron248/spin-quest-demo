import { Page, Locator, expect } from '@playwright/test';

export interface OpenSiteOptions {
  email: string;
  password: string;
  /** Site to open. Defaults to the production site. */
  url?: string;
  /** Submit the form after filling it. Defaults to true. */
  submit?: boolean;
}

export interface SignUpOptions {
  email: string;
  username: string;
  password: string;
  /** Defaults to `password`. */
  confirmPassword?: string;
  /** Click CONTINUE after filling the form. Defaults to true. */
  submit?: boolean;
}

export interface RegistrationDetails {
  firstName: string;
  lastName: string;
  /** State name as shown in the dropdown, e.g. 'FLORIDA'. */
  state: string;
  /** Date-of-birth picker labels, e.g. 'Aug', '10', '2001'. */
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  phone: string;
  /** Tick the terms checkbox. Defaults to true. */
  acceptTerms?: boolean;
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

  readonly signUpButton: Locator;
  readonly signUpEmailInput: Locator;
  readonly signUpUsernameInput: Locator;
  readonly signUpPasswordInput: Locator;
  readonly signUpConfirmPasswordInput: Locator;
  readonly continueButton: Locator;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly stateCombobox: Locator;
  readonly phoneInput: Locator;
  readonly termsCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openLoginButton = page.getByRole('button', { name: 'LOGIN' });
    this.usernameInput = page.getByRole('textbox', { name: 'Enter email or username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.locator('form').getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
    this.turnstileFrame = page.locator('iframe[src*="challenges.cloudflare.com"]');

    this.signUpButton = page.getByRole('button', { name: 'SIGN UP' });
    this.signUpEmailInput = page.getByRole('textbox', { name: 'Enter email' });
    this.signUpUsernameInput = page.getByRole('textbox', { name: 'Enter username' });
    this.signUpPasswordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    this.signUpConfirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });
    this.continueButton = page.getByRole('button', { name: 'CONTINUE' });

    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.stateCombobox = page.getByRole('combobox', { name: 'Select State' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone Number' });
    this.termsCheckbox = page.getByRole('checkbox').first();
  }

  async goto() {
    await this.page.goto("https://spinquest.com");
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
    await this.page.waitForLoadState();

    await this.open();
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.solveTurnstile();

    if (submit) {
      await this.submitButton.click();
    }
  }

  /**
   * Parametrized sign-up flow: open the SIGN UP form, fill the given details,
   * solve Turnstile, and (optionally) submit with CONTINUE.
   */
  async signUp(options: SignUpOptions) {
    const { email, username, password, confirmPassword = password, submit = true } = options;

    await this.signUpButton.click();
    await this.signUpEmailInput.fill(email);
    await this.signUpUsernameInput.fill(username);
    await this.signUpPasswordInput.fill(password);
    await this.signUpConfirmPasswordInput.fill(confirmPassword);
    await this.solveTurnstile();

    if (submit) {
      await this.continueButton.click();
    }
  }

  /**
   * Parametrized registration-details step (screen after `signUp`): fills the
   * name, state, date of birth and phone, then optionally ticks the terms box.
   */
  async fillRegistrationDetails(details: RegistrationDetails) {
    const {
      firstName,
      lastName,
      state,
      birthMonth,
      birthDay,
      birthYear,
      phone,
      acceptTerms = true,
    } = details;

    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);

    await this.stateCombobox.click();
    await this.page.getByRole('option', { name: state, exact: true }).click();

    await this.page.getByRole('button', { name: birthMonth}).click();
    await this.page.getByRole('button', { name: birthDay}).click();
    await this.page.getByRole('button', { name: birthYear}).click();

    await this.phoneInput.fill(phone);

    if (acceptTerms) {
      await this.termsCheckbox.check();
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
