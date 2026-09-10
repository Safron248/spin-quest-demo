# spin-quest-demo

Demo Playwright UI automation framework to assess difficulty and possible
friction points.

## Overview

The framework is built in three layers. Each layer removes a bit of repetition
from the one above it, so that a test file ends up containing test logic and
almost nothing else.

```
Playwright `page`  ──►  Page Objects  ──►  Page Object Manager  ──►  `pom` fixture  ──►  test
   (raw browser)         (per screen)        (all screens)          (auto-wired)      (just assertions)
```

## Directory structure

```
page-object-models/      one class per screen / feature area
  landing.page.ts          LandingPage   - login, sign-up, registration, FAQ
  home.page.ts             HomePage      - placeholder class
  game.page.ts             GamePage      - placeholder class
  pom.ts                   PageObjectManager - aggregates all of the above

fixtures/
  pom.fixture.ts           extends Playwright's `test` with a `pom` fixture

tests/
  landing.spec.ts          current tests - consume the `pom` fixture
  landing.raw.spec.ts      legacy artifact, kept for demo purposes only

playwright.config.ts       projects (chromium / firefox / webkit), reporter, trace
```

## The three layers

### 1. Page Object — one class per screen

A page object wraps a single Playwright `Page` and exposes:

- **locators** as named `readonly` fields, defined once in the constructor, and
- **flows** as `async` methods that string those locators together
  (`goto()`, `openSite()`, `signUp()`, `fillRegistrationDetails()`, …).

```ts
export class LandingPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Enter email or username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
  }

  async openSite({ email, password, submit = true }: OpenSiteOptions) {
    await this.open();
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    if (submit) await this.submitButton.click();
  }
}
```

If the site changes a selector or a flow, it is fixed here **once** instead of
in every test that touched it.

### 2. Page Object Manager — one class for all screens

`PageObjectManager` (`page-object-models/pom.ts`) takes the `Page` once and
constructs every page object from it, all sharing that same `Page`:

```ts
export class PageObjectManager {
  readonly home: HomePage;
  readonly landing: LandingPage;
  readonly game: GamePage;

  constructor(page: Page) {
    this.home = new HomePage(page);
    this.landing = new LandingPage(page);
    this.game = new GamePage(page);
  }
}
```

A test now needs a single `new PageObjectManager(page)` instead of one
`new XPage(page)` per screen, and a multi-screen flow reads naturally:

```ts
await pom.landing.openSite({ email, password });
await pom.game.spinButton.click();
```

(`POM` and `POManager` are exported as aliases for backwards compatibility.)

### 3. `pom` fixture — no `new` at all

`fixtures/pom.fixture.ts` extends Playwright's built-in `test` with a `pom`
fixture that builds the manager from the test's own `page` and hands it over:

```ts
export const test = base.extend<POMFixtures>({
  pom: async ({ page }, use) => {
    await use(new PageObjectManager(page));
  },
});
export { expect } from '@playwright/test';
```

Tests import `test` / `expect` from this file instead of `@playwright/test` and
just ask for `{ pom }`:

```ts
import { test, expect } from '../fixtures/pom.fixture';

test.describe('Landing page', () => {
  test.beforeEach(async ({ pom }) => {
    await pom.landing.goto();
  });

  test('initiate login', async ({ pom }) => {
    await pom.landing.openSite({ email: validUser, password: validPassword });
  });
});
```

The `page` fixture is still available alongside `pom` for one-off checks that do
not deserve a page-object method.

## How the layers interact at runtime

For each test, Playwright:

1. creates a fresh browser `page`,
2. resolves the `pom` fixture, which runs `new PageObjectManager(page)`,
3. the manager's constructor runs `new HomePage(page)`, `new LandingPage(page)`,
   `new GamePage(page)` — every page object is bound to the **same** `page`,
4. injects the ready `pom` into the test body.

Because everything shares one `page`, actions taken through `pom.landing` and
assertions made through `pom.game` operate on the same browser tab with no
wiring on the test's part.

## Why this stays maintainable

| Concern | Where it lives | Blast radius of a change |
| --- | --- | --- |
| A selector on the landing page | `landing.page.ts` constructor | one line |
| A multi-step flow (login, sign-up) | a method on the page object | one method |
| A brand-new screen | new `*.page.ts` + one line in `pom.ts` | two files |
| How tests obtain their page objects | `pom.fixture.ts` | one file |
| A test's intent | the `*.spec.ts` file | that test only |

Test files carry no setup boilerplate, no `new`, and no duplicated locator
strings, so they read as a description of behaviour. `landing.raw.spec.ts` is
kept as a before/after reference showing the manual `new LandingPage(page)`
style that these layers replaced.

## Adding a new page object

1. Create `page-object-models/<name>.page.ts` with a class that takes `page` in
   its constructor.
2. Add a field and a `new <Name>Page(page)` line to `PageObjectManager`.
3. It is immediately reachable in every test as `pom.<name>`.

## Running the tests  

```bash
npx playwright test                       # all projects
npx playwright test tests/landing.spec.ts  # one file
npx playwright test --project=chromium     # one browser
npx playwright show-report                 # open the HTML report
```
