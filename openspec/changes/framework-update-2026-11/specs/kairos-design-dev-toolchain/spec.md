# Spec Delta: kairos-design-dev-toolchain

## Purpose

Keep the kairos-design workshop, story runner and type checker installable from the committed lockfile at known versions, passing their checks, free of the advisories stack-watch reports, with every version held back recorded alongside its reason.

## ADDED Requirements

### Requirement: The toolchain installs reproducibly at the planned versions
The repository SHALL install with `npm ci` from its committed `package-lock.json`, and the installed version of every direct development dependency SHALL be the target given in the change's versions table, or the fallback named in its holds when `checks/holds.md` records why.

#### Scenario: Frozen install
- **WHEN** `rm -rf node_modules && npm ci` runs on Node 22.12 or later after the change
- **THEN** it exits 0 and `package-lock.json` is not rewritten
- **CHECK** `checks/install.txt` records `node -v`, `npm -v` and the `npm ci` exit code 0, and `git status --porcelain -- package-lock.json` printed nothing afterwards

#### Scenario: Planned versions are the installed versions
- **WHEN** `npm ls --depth=0 --json` runs after the final install
- **THEN** each direct development dependency resolves to its target version, or to the fallback that `checks/holds.md` names with its failing output
- **CHECK** `checks/versions.txt` holds the `npm ls --depth=0` output, and `checks/REPORT.md` lists each row of the versions table against it as match or hold

#### Scenario: TypeScript stays on the 6 line
- **WHEN** `npm ls typescript --depth=0` runs
- **THEN** it shows typescript 6.0.3 (or 5.9.3 under the hold rule), never 7.x
- **CHECK** `checks/versions.txt` shows the typescript line, and `package.json` declares `^6.0.3`

### Requirement: No advisory from the 11 November 2026 list remains
After the change, no package version named in the stack-watch advisory list of 11 November 2026 SHALL remain anywhere in `package-lock.json`, including packages that only the workshop and CI use. Any advisory `npm audit` still reports SHALL be listed with its reason.

#### Scenario: Lockfile scan
- **WHEN** `node checks/scripts/advisory-scan.mjs` reads `package-lock.json`
- **THEN** no entry matches a vulnerable range: storybook and @storybook/addon-vitest below 10.6.2, vite 7.x up to 7.3.6, brace-expansion 4.0.0 to below 5.0.12, source-map-js below 1.2.2, @vitest/mocker below 4.1.12, glob 9.0.0 to 14.0.1, minimatch 7.0.0 to below 11.0.1
- **CHECK** the script exits 0 after the change; `checks/audit-before.txt` holds its failing output from task 1.2 naming all eight packages

#### Scenario: npm audit after the change
- **WHEN** `npm audit --json` runs after the final install
- **THEN** it reports zero vulnerabilities, or each one it still reports is named with its reason
- **CHECK** `checks/audit-after.md` holds the severity totals from `npm audit --json` (expected all 0) and any remaining advisory with its reason

#### Scenario: The glob override reaches the docgen plugin
- **WHEN** `npm ls glob minimatch brace-expansion source-map-js @vitest/mocker --all` and `npm explain glob` run
- **THEN** `npm ls` shows glob 14.0.4 or later, minimatch 11.0.1 or later, brace-expansion 5.0.12 or later, source-map-js 1.2.2 or later, and @vitest/mocker 4.1.12 or later, and no other copy of any of them; `npm explain glob` shows the docgen plugin's glob as `overridden glob@"^14.0.4"` (npm ls marks an override only when the rule is an exact version, and this rule is a range)
- **CHECK** `checks/overrides.txt` holds both outputs

### Requirement: The workshop checks pass on the new toolchain
The four checks CI runs (`npm test`, `npm run typecheck`, `npm run build-storybook`, `npm run test-stories`) SHALL pass after the change, with no fewer tests or stories than before it and no test skipped that ran before.

#### Scenario: Node suite unchanged
- **WHEN** `npm test` runs after the change
- **THEN** every test passes and the pass count equals the count recorded before the change
- **CHECK** `checks/ci-commands.md` records the `npm test` totals before (task 1.1) and after (task 4.1), equal, 0 failed

#### Scenario: Typecheck passes
- **WHEN** `npm run typecheck` runs after the change
- **THEN** it exits 0 with no file under `dist/` edited to get there
- **CHECK** `checks/ci-commands.md` records exit 0, and `git diff f565e34 --name-only -- dist bin docs` prints nothing

#### Scenario: Workshop builds
- **WHEN** `npm run build-storybook` runs after the change
- **THEN** it exits 0 and writes `storybook-static/index.html`
- **CHECK** `checks/ci-commands.md` records exit 0 and `test -f storybook-static/index.html` succeeding

#### Scenario: Every story renders and passes axe
- **WHEN** `npm run test-stories` runs in headless Chromium after `npx playwright install --with-deps chromium`
- **THEN** every story test passes, none is skipped, and the number of story tests equals the number recorded before the change
- **CHECK** `checks/stories-before.json` and `checks/stories-after.json` (Vitest JSON reporter) show equal `numTotalTests`, `numFailedTests` 0 and `numPendingTests` 0 after

### Requirement: Held versions are recorded with their reason
Every direct development dependency not moved to its target version SHALL have an entry in `checks/holds.md` naming the version kept, the check that failed on the target (command and output excerpt) and the advisory fix that the kept version still carries.

#### Scenario: Hold record matches the install
- **WHEN** `checks/holds.md` is compared with `checks/versions.txt`
- **THEN** every package below its target in `versions.txt` has an entry in `holds.md`, TypeScript 6.0.3 (planned hold) included, and no entry names a package that reached its target
- **CHECK** `checks/REPORT.md` lists each hold with its entry; the planner checks the two files against each other in review
