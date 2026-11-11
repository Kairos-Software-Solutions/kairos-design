# CI commands: before and after

## Before (task 1.1, untouched f565e34, Node v24.22.2, npm 11.19.1)

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | installed from the f565e34 lockfile |
| `npx playwright install --with-deps chromium` | 0 | Chromium for Playwright 1.62.1 (headless shell v1234) |
| `npm test` | 0 | tests 112, pass 112, fail 0, cancelled 0, skipped 0, todo 0 |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json` | 0 | 16 files; `numTotalTests` 67, `numPassedTests` 67, `numFailedTests` 0, `numPendingTests` 0 |

No story failed on the old code. Vitest 4 printed "close timed out after 10000ms … something prevents the main process from exiting" after the report, then exited 0.

## After (task 4.1, final lockfile, Node v24.22.2, npm 11.19.1, CI's order)

| Command | Exit | Result |
| --- | --- | --- |
| `rm -rf node_modules storybook-static && npm ci` | 0 | 287 packages, "found 0 vulnerabilities"; `git status --porcelain -- package-lock.json` empty (`checks/install.txt`) |
| `npm test` | 0 | tests 112, pass 112, fail 0, cancelled 0, skipped 0, todo 0 (before: 112 / 112 / 0) |
| `npm run typecheck` | 0 | `tsc` 6.0.3, no output; `git diff f565e34 --name-only -- dist bin docs` empty |
| `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` | 0 | "Storybook build completed successfully" (only Vite's chunk-size notice) |
| `test -f storybook-static/index.html` | 0 | present |
| `npx playwright install --with-deps chromium` | 0 | Chromium for Playwright 1.65.0 (v1254) |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-after.json` | 0 | 16 files; `numTotalTests` 67, `numPassedTests` 67, `numFailedTests` 0, `numPendingTests` 0, `numTodoTests` 0 (before: 67 / 67 / 0 / 0) |

Equal to "Before": `npm test` 112 = 112 and stories `numTotalTests` 67 = 67, 0 failed and 0 pending after.

Notes: `npm ci` warns that `esbuild@0.28.2`'s postinstall is "not yet covered by allowScripts" (npm 11.19's install-scripts check). It is advisory: the warning appears and the workshop build, which uses esbuild through Storybook, passes. No `allowScripts` config was added because it is a `package.json` field outside `devDependencies`/`overrides`. Vitest 5 still prints "close timed out after 10000ms … something prevents Vite server from exiting" after the report, as Vitest 4 did in the baseline; the run exits 0. Both runs warn "No story files found for the specified pattern: stories/**/*.mdx", which was already true before this change.
