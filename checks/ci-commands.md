# CI commands

## Before (untouched checkout at 09dbce8, Node v24.22.3, npm 11.19.1)

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | installed |
| `npx playwright install --with-deps chromium` | 0 | chromium-headless-shell installed |
| `npm test` | 0 | 112 tests, 112 pass, 0 fail |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json` | 0 | 67 tests in 16 files, 67 pass, 0 fail, 0 skipped |
| `npm pack --dry-run --json --ignore-scripts > checks/pack-before.json` | 0 | 42 files, 140,564 bytes packed, 464,988 unpacked |

## After (task 7.1, at 366d9aa, fresh `node_modules`, Node v24.22.3, npm 11.19.1)

In CI's order, one run, each exit code from the run's own log.

| Command | Exit | Result |
| --- | --- | --- |
| `rm -rf node_modules storybook-static && npm ci` | 0 | installed |
| `npm test` | 0 | 147 tests, 147 pass, 0 fail (Before: 112) |
| `npm run typecheck` | 0 | no errors |
| `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` | 0 | "Storybook build completed successfully" |
| `npx playwright install --with-deps chromium` | 0 | chromium present |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-after.json` | 0 | 80 tests in 21 files, numPassedTests 80, numFailedTests 0, numPendingTests 0 (Before: 67 in 16) |
| `npm pack --dry-run --json --ignore-scripts > checks/pack-after.json` | 0 | 43 files, 155,871 bytes packed, 529,403 unpacked (Before: 42 files, 140,564 / 464,988) |

`tests/contrast.test.mjs`: 11 tests, 11 pass (the 7 existing tests unchanged, plus 4 new).

Sizes: `dist/kairos.css` 199,387 bytes (50,209 gzip -9; Before 165,447 / 43,322), `dist/tokens.css` 35,697 (11,344 gzip -9; Before 21,263 / 7,691), new `dist/brand.css` 7,654 (2,153 gzip -9).
