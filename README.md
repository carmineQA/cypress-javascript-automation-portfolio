# Cypress JavaScript Automation Portfolio

A Cypress + JavaScript test automation project, companion to the
[Playwright + TypeScript](../playwright-typescript-automation-portfolio) and
[Selenium + Java](../selenium-java-automation-portfolio) portfolio projects. Where those two
demonstrate real-API integration testing, this project demonstrates Cypress's other distinctive
strength: idiomatic custom commands instead of a ported Page Object Model, and network-level
mocking with `cy.intercept()` for scenarios that can't be forced on demand against a live public
API — the gap a "only ever tests against real APIs" portfolio would otherwise leave uncovered.

## Tech stack

- [Cypress](https://www.cypress.io/) + JavaScript
- [`@cypress/grep`](https://github.com/cypress-io/cypress/tree/develop/npm/grep) — official `@smoke`/`@regression` tagging (the community `cypress-grep` package it replaces is deprecated)
- [`cypress-mochawesome-reporter`](https://github.com/LironEr/cypress-mochawesome-reporter) — HTML/JSON reporting, deliberately different from Allure (used in the Selenium project) to avoid repeating the same reporting tool across all three portfolio projects
- [`@faker-js/faker`](https://fakerjs.dev/) — randomized test data (shared convention with the Playwright project)
- ESLint (`@eslint/js` + `eslint-plugin-cypress`) + Prettier

## Project structure

| Level | Target | Tests | Type |
|---|---|---|---|
| 1 | [SauceDemo](https://www.saucedemo.com/) | `cypress/e2e/ui` | UI (custom commands) |
| 2 | [Restful Booker](https://restful-booker.herokuapp.com/) | `cypress/e2e/api` | API (real `cy.request()` calls) |
| 3 | Local test harness (`cypress/fixtures/pages/booking-viewer.html`) | `cypress/e2e/mocked` | Network mocking (`cy.intercept()`) |

SauceDemo and Restful Booker are the same targets used by the Playwright and Selenium companion
projects, for direct side-by-side comparison of the same scenarios across all three toolchains.

Reusable actions (login, add to cart, checkout, logout) live in `cypress/support/commands.js` as
Cypress custom commands, organized by domain rather than as ported Page Object classes — the
idiomatic Cypress pattern, not a 1:1 translation of the other two projects' architecture.

**A naming note to avoid confusion when comparing this repo with the other two:** `cypress/fixtures/`
holds mock JSON/HTML payloads (Cypress's own meaning of "fixture" — static test data), which is a
different concept from `fixtures/base.ts` in the Playwright project (a Playwright test-runner
extension) or the driver setup in the Selenium project's test base classes. Same word, three
different meanings across the three companion projects — worth knowing before assuming they map
1:1.

Design decisions — including real Cypress-specific issues found and fixed during development —
are documented in `docs/decisions.md`.

## Prerequisites

- Node.js (LTS)
- npm

## Installation

```bash
git clone https://github.com/carmineQA/cypress-javascript-automation-portfolio.git
cd cypress-javascript-automation-portfolio
npm install
```

## Configuration

Export the Restful Booker demo credentials before running the API/CRUD test:

```bash
export RESTFUL_BOOKER_USERNAME=admin
export RESTFUL_BOOKER_PASSWORD=password123
```

## Running the tests

```bash
npm test                  # full suite (UI + API + mocked)
npm run test:smoke        # @smoke tests only (same as the push/PR CI workflow)
npm run test:regression   # @regression tests (same as the CI regression workflow)
npm run cy:open           # interactive Cypress runner
```

## Code quality

```bash
npm run lint
npm run format:check
```

Runs as a required `lint` job in CI before any test job starts — see `.github/workflows/`.

## Report

```bash
npm test   # generates mochawesome-report/index.html automatically after the run
```

Open `mochawesome-report/index.html` in a browser. In CI, the regression workflow shards the
suite across 3 parallel jobs (`ui`, `api`, `mocked`) and uploads each job's own HTML report as a
separate artifact — see `docs/decisions.md` for why these aren't merged into a single combined
report the way the Playwright/Selenium companion projects do.

## Dependency updates

Dependabot checks weekly for outdated npm dependencies and GitHub Actions used in the workflows
(`.github/dependabot.yml`).
