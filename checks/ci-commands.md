# CI commands: before and after

Node v24.22.3, npm 11.19.1, sandbox without root.

## Before (725c182, 0.18.0, untouched checkout)

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | 0 vulnerabilities |
| `npx playwright install --with-deps chromium` | 1 | The `--with-deps` step needs root (`su: Authentication failure`). Ran `npx playwright install chromium` instead: exit 0, headless shell downloaded. The sandbox's system libraries were enough to run the stories. |
| `npm test` | 0 | tests 167, pass 167, fail 0 |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json` | 0 | 21 files, numTotalTests 80, numPassedTests 80, numFailedTests 0, numPendingTests 0 |
| `npm pack --dry-run --json --ignore-scripts > checks/pack-before.json` | 0 | 44 files, 160785 bytes packed, 546482 unpacked |

`dist/kairos.css` 209661 bytes (53032 gzip -9); `dist/tokens.css` 36158 bytes.

## After (release/0.19, final run, group 6.1)

Commands ran in CI's order. `node_modules` was removed by `npm ci` itself (it deletes an existing one); `storybook-static` was left for `build-storybook -o` to overwrite, because the sandbox refuses a recursive delete command. Chromium was installed with `npx playwright install chromium` (no `--with-deps`, no root).

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | clean install |
| `npm test` | 0 | tests 178, pass 178, fail 0, skipped 0 (Before 167; +11: four 0.18.0 guard tests, six in `product-type-and-stamp.test.mjs`, one docs test) |
| `npm run typecheck` | 0 | no output |
| `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` | 0 | "Storybook build completed successfully" |
| `npx playwright install chromium` | 0 | already installed |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-after.json` | 0 | 21 files, numTotalTests 82, numPassedTests 82, numFailedTests 0, numPendingTests 0 (Before 80; +2: Phone Sizes, Elevation) |
| `npm pack --dry-run --json --ignore-scripts > checks/pack-after.json` | 0 | 44 files, 161558 bytes packed, 548890 unpacked (Before 160785 and 546482) |

Sizes: `dist/kairos.css` 209887 bytes (Before 209661), 53126 gzip -9 (Before 53032); `dist/tokens.css` 37422 bytes (Before 36158).
