# Architecture Decision Record

A short log of non-obvious technical decisions made on this project, with the reasoning behind
them. Companion project to `playwright-typescript-automation-portfolio` (Playwright + TypeScript) and
`selenium-java-automation-portfolio`; see those projects' own `docs/decisions.md` for their
own ADR entries.

## 2026-07-24 — Rewritten from TypeScript to plain JavaScript

**Decision:** every `.cy.ts` spec, `cypress.config.ts`, and `cypress/support/*.ts` file was
rewritten as plain `.js`. `typescript`, `typescript-eslint`, and `@types/node` were removed from
`devDependencies`, replaced by `@eslint/js` for ESLint's plain-JavaScript recommended rules, and
the `typecheck` npm script and its CI step were removed.

**Why:** the project was originally implemented in TypeScript, for consistency with the
Playwright and Selenium (also statically typed) companion projects — a choice made explicitly in
the project proposal this repo implements. That created a real inconsistency: this repository is
named `cypress-javascript-automation-portfolio`, and the proposal's own top-level framing was
"Cypress + JavaScript", yet the code was TypeScript. Once noticed, the repository name was kept
(it was already the agreed, GitHub-visible name across the 3-project portfolio) and the code was
rewritten to actually match it, rather than silently leaving the mismatch in place.

**How to apply:** keep new specs in plain JavaScript (`.cy.js`). If TypeScript is wanted back in
the future for this project specifically, rename the repository to
`cypress-typescript-automation-portfolio` at the same time, so the name and the code never
diverge again.

## 2026-07-23 — `@cypress/grep`, not the deprecated `cypress-grep` community package

**Decision:** tagging (`@smoke`/`@regression`) uses the official `@cypress/grep` package, invoked
via `cypress run --expose grepTags=@smoke` (not `--env grepTags=@smoke`).

**Why:** `cypress-grep` (the original community package) is deprecated in favor of the official
`@cypress/grep`, which ships from the Cypress team itself. The two also differ in invocation: the
older package read tags from `--env`, while the current `@cypress/grep` (v6) reads them from
`--expose` — using `--env` silently runs the entire suite with no filtering at all, which was
confirmed directly (a full run showed 8/8 tests passing under a `@smoke`-only invocation, when
only 4 are actually tagged `@smoke`). Switching to `--expose` was verified to correctly skip the
4 non-`@smoke` tests.

**How to apply:** always use `npm run test:smoke` / `npm run test:regression` (which use
`--expose`), not a hand-rolled `--env grepTags=...` invocation.

## 2026-07-23 — The mocked network suite runs against a local static HTML page, not SauceDemo

**Decision:** `cypress/e2e/mocked/bookingErrors.cy.ts` exercises `cy.intercept()` against a small
static harness page (`cypress/fixtures/pages/booking-viewer.html`) that fetches a booking from
Restful Booker and renders either its details or an error message, instead of stubbing a network
call inside the SauceDemo app.

**Why:** `cy.intercept()` only intercepts requests the *browser* makes from a loaded page — it
cannot intercept `cy.request()` calls (those run outside the browser's network stack, which is
why `cypress/e2e/api/booking.cy.ts` uses `cy.request()` directly against the real API). SauceDemo
itself makes no dynamic API calls after its initial load (it's a fully client-rendered demo app
with hardcoded product data), so there was nothing meaningful to intercept there. Building this
demonstration around a small page that performs an actual `fetch()` call is what allows a
genuinely realistic exercise of the technique (a 500 error, an incomplete payload, and a slow
response — three scenarios that cannot be forced on demand against the real, live Restful Booker
API used elsewhere in this project), instead of a contrived example against a page that doesn't
need network mocking to begin with.

**How to apply:** this spec sets `{ baseUrl: null }` as a per-suite config override (see the next
entry for why), and visits `cypress/fixtures/pages/booking-viewer.html` as a plain relative path.
If more mocked scenarios are added later, extend this same harness page rather than adding a new
one, unless a genuinely different page shape is needed.

## 2026-07-23 — `cy.visit()` of a local file requires `{ baseUrl: null }` on the suite

**Decision:** `bookingErrors.cy.ts` overrides `baseUrl` to `null` at the `describe()` level:
`describe('...', { baseUrl: null }, () => { ... })`.

**Why:** with a global `baseUrl` configured (`https://www.saucedemo.com`, used by every UI spec),
`cy.visit('cypress/fixtures/pages/booking-viewer.html')` resolves the path *against that
baseUrl* rather than as a local file — Cypress requested
`https://www.saucedemo.com/cypress/fixtures/pages/booking-viewer.html` and got a real 404. This
was confirmed directly from the resulting `CypressError`, not assumed. Prefixing the path with an
absolute `file://` URL was tried first and produced the same failure — Cypress still prepended
`baseUrl` to it (`https://www.saucedemo.com/file://...`), meaning it doesn't special-case
`file://` as already-absolute. Setting `baseUrl: null` for just this suite was the fix that
actually worked, verified by a passing run afterwards.

**How to apply:** any future spec that needs to visit a local (non-`baseUrl`) page must set
`{ baseUrl: null }` on its `describe()` block; a bare relative path without that override will
silently resolve against the global `baseUrl` and 404 instead of failing in an obviously
diagnosable way.

## 2026-07-23 — `cypress-mochawesome-reporter`'s transitive dependencies have known audit findings

**Decision:** `cypress-mochawesome-reporter` (and the `mochawesome`/`uuid`/`serialize-javascript`
chain it depends on) is used as-is despite `npm audit` reporting moderate/high severity advisories
in that chain, with no non-breaking fix currently available (`npm audit fix` makes no changes).

**Why:** these advisories are in reporting/test-tooling dependencies that run only locally or in
CI against this project's own test output — they are not part of any code that talks to real user
data or production traffic, and the project intentionally targets public demo APIs with no
sensitive data at stake. This is a real, disclosed trade-off, not an oversight: `mochawesome` is
the library the project's own [project proposal](../project-proposals-selenium-cypress.html)
called for as the idiomatic JS-ecosystem reporter (deliberately different from Allure, used in the
Selenium companion project, to avoid repeating the same tool across all three portfolio projects).

**How to apply:** if `cypress-mochawesome-reporter` publishes an update pulling in patched
transitive dependencies, upgrade to it. Re-run `npm audit` after any dependency bump to confirm
whether this note can be removed.

## 2026-07-23 — CI regression report is per-shard, not merged into one combined report

**Decision:** `.github/workflows/regression.yml` shards the regression suite across 3 parallel
jobs by folder (`ui`, `api`, `mocked`) and uploads each job's own HTML report as a separate
artifact, instead of merging all three into one combined report the way the Playwright and
Selenium companion projects do (via Playwright's blob-report merge and Allure's own multi-run
aggregation, respectively).

**Why:** `cypress-mochawesome-reporter` deletes its intermediate per-spec JSON files
(`mochawesome-report/.jsons/`) once it finishes generating that job's own HTML report — confirmed
directly by inspecting the directory after a local run, not assumed. That leaves nothing to
merge across separately-run CI jobs without adding `mochawesome-merge` +
`mochawesome-report-generator` as extra dependencies solely to reconstruct raw JSON the reporter
already discards by design. Cypress's own supported way to get one unified cross-shard report is
Cypress Cloud, which this project deliberately avoids (see the project proposal this repo
implements) to not depend on an external paid service a recruiter can't verify for free.

**How to apply:** three independent, self-contained HTML reports (one per shard) is an accepted,
documented trade-off for this project, not a gap to silently work around. If a genuinely unified
report becomes worth the added dependency surface, `mochawesome-merge` is the natural next
step — configure `cypress-mochawesome-reporter`'s `overwrite`/cleanup behavior first so the raw
JSON survives long enough to be uploaded and merged.
