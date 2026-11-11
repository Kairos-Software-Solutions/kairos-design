# CI commands: before and after

## Before (task 1.1, untouched f565e34, Node v24.22.2, npm 11.19.1)

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | installed from the f565e34 lockfile |
| `npx playwright install --with-deps chromium` | 0 | Chromium for Playwright 1.62.1 (headless shell v1234) |
| `npm test` | 0 | tests 112, pass 112, fail 0, cancelled 0, skipped 0, todo 0 |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json` | 0 | 16 files; `numTotalTests` 67, `numPassedTests` 67, `numFailedTests` 0, `numPendingTests` 0 |

No story failed on the old code. Vitest 4 printed "close timed out after 10000ms … something prevents the main process from exiting" after the report, then exited 0.
