# CI commands, before and after

## Before (untouched checkout d36d95c, 0.17.0, Node 24.22.3)

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | installed |
| `npx playwright install --with-deps chromium` | 0 | Chromium headless shell installed |
| `npm test` | 0 | 147 tests, 147 pass, 0 fail |
| `npx vitest run --project stories ...` (`checks/stories-before.json`) | 1 | 80 stories in 21 files, 79 pass, 1 fail, 0 skipped. Failing: `Brand/Actions` › "Without The Switch" (expects `uppercase`, got `none`; 0.17.0's sentence case; task 4.1 fixes it) |
| `npm pack --dry-run --json --ignore-scripts` (`checks/pack-before.json`) | 0 | 44 files, 159,992 bytes packed, 543,971 unpacked |

`dist/kairos.css` 208,336 bytes.
