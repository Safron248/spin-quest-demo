import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LandingPage } from '../page-object-models/landing.page';

const validUser = process.env.TEST_USER ?? 'testuser@gmail.com';
const validPassword = process.env.TEST_PASSWORD ?? 'testpassword';

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();

const newAccount = {
  email: faker.internet.email({ firstName, lastName }),
  username: "demoTestUser",
  password: 'Password123',
};

test.describe('Landing page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.goto();
  });

  test('initiate login', async () => {
    await landingPage.openSite({ email: validUser, password: validPassword });
  });
  // simple one-off test, does not require to be abstracted into separate function
  test('first CTA', async ({ page }) => {
    await page.getByRole('button', { name: 'CREATE ACCOUNT' }).click()
    await expect(page.getByText('Create account', { exact: true })).toBeVisible()
  })

  test('second CTA', async ({ page }) => {
    await page.getByRole('button', { name: 'START NOW' }).click()
    await expect(page.getByText('Create account', { exact: true })).toBeVisible()
  })

  test('what is a social casino text validation', async ({ page }) => {
    const accordion = page.getByRole('button', { name: 'What is a social casino?', exact: true })
    await accordion.click()

    await expect(accordion).toContainClass('active')
    await expect(page.getByText(
      'A social casino is an online platform where you can play casino-style games like ' +
      'slots, blackjack, roulette and craps purely for entertainment. Unlike traditional ' +
      'online casinos, social casinos do not offer real-money gaming. Instead, you play ' +
      'with virtual coins that have no cash value, which you can earn or claim for free.',
      { exact: true },
    )).toBeVisible()
  })

  test('is it free to play validation', async ({ page }) => {
    const accordion = page.getByRole('button', { name: 'Is it free to play?', exact: true })
    await accordion.click()

    await expect(accordion).toContainClass('active')
    await expect(page.getByText(
      'Yes! You can claim free coins daily and through ongoing promotions. Optional coin ' +
      "packages are available, but they're never required to enjoy the games.",
      { exact: true },
    )).toBeVisible()
  })

  test('why do players love spinquest validation', async ({ page }) => {
    const accordion = page.getByRole('button', { name: 'Why do players love SpinQuest?', exact: true })
    await accordion.click()

    await expect(accordion).toContainClass('active')
    await expect(page.getByText(
      "SpinQuest is built by players, for players. We know what makes gameplay exciting " +
      "because we're passionate about it ourselves. Our focus is on delivering a fun, " +
      'rewarding experience with fresh content, a vibrant community, and a constantly ' +
      "growing selection of games. We're always working on new features and have exciting " +
      "games and updates just around the corner — so there's always something to look " +
      'forward to.',
      { exact: true },
    )).toBeVisible()
  })
  // parametrized reusable flows
  test('sign up flow', async () => {
    await landingPage.signUp(newAccount);
  });

  test('registration details', async () => {
    await landingPage.signUp(newAccount);
    await landingPage.fillRegistrationDetails({
      firstName,
      lastName,
      state: 'FLORIDA',
      birthMonth: 'Aug',
      birthDay: '10',
      birthYear: '2001',
      phone: '7865854848',
    });
  });

});



