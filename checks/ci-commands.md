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

## After (final tree, Node 24.22.3, fresh `rm -rf node_modules storybook-static && npm ci`)

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | installed |
| `npm test` | 0 | 167 tests, 167 pass, 0 fail (was 147) |
| `npm run typecheck` | 0 | clean |
| `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` | 0 | completed |
| `npx playwright install --with-deps chromium` | 0 | installed |
| `npx vitest run --project stories ...` (`checks/stories-after.json`) | 0 | 80 stories in 21 files, 80 pass, 0 fail, 0 skipped (before: 80 total, 79 pass, 1 fail) |
| `npm pack --dry-run --json --ignore-scripts` (`checks/pack-after.json`) | 0 | 44 files, 160,785 bytes packed, 546,482 unpacked (before: 44, 159,992, 543,971) |

`dist/kairos.css` 209,661 bytes (before 208,336); `gzip -9` 53,032 bytes (before 52,657).
