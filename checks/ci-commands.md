# CI commands

## Before (untouched checkout at 09dbce8, Node v24.22.3, npm 11.19.1)

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | installed |
| `npx playwright install --with-deps chromium` | 0 | chromium-headless-shell installed |
| `npm test` | 0 | 112 tests, 112 pass, 0 fail |
| `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json` | 0 | 67 tests in 16 files, 67 pass, 0 fail, 0 skipped |
| `npm pack --dry-run --json --ignore-scripts > checks/pack-before.json` | 0 | 42 files, 140,564 bytes packed, 464,988 unpacked |
