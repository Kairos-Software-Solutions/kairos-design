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
