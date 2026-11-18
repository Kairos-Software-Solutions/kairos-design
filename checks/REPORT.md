# Build report: brand-2026-epilogue (kairos-design 0.18.0)

Node 24.22.3, npm. Nothing pushed, the change is not archived.

## Tasks

| Task | Check | Result |
|---|---|---|
| 1.1 Baseline at d36d95c | all five commands complete, figures recorded in `ci-commands.md` | `npm test` 147/147; stories 80 total, 79 pass, 1 fail (`Brand/Actions` › "Without The Switch", expected); pack 44 files, 159,992 bytes |
| 1.2 0.17.0 guard, website names | three 0.17.0 tests pass with the 0.18 lists emptied (0.17.0 against itself); fail after one hand edit; `node --test tests/release.test.mjs` | With the lists emptied on the untouched code all six `product-scale` tests passed. Bite: changing one `font-weight` in `dist/kairos.css` made "every 0.17.0 declaration…" fail (and the 0.14 one); adding a declaration on `.kairos-button` made "a new 0.18 rule…" fail; adding a byte to the fixture made "the 0.17.0 fixture is the published 0.17.0" fail. A bogus name in the website fixture failed "every name the website reads…". All reverted. With the lists in place the "resolves the same" test failed until 3.2, as expected. `release.test.mjs` 7/7 |
| 2.1 Fonts, lock revision 3 type, no width | the six named test files pass; `scale.test.mjs` passes; only the 0.17.0 "resolves the same" test fails, on the marker `transform` | 154 tests, 153 pass; the one failure was `.kairos-marker::after transform` |
| 3.1 P3, P4, P5 | `node --test tests/brand-parts… brand-scale… contract… scale…` | 55/55 |
| 3.2 P1, P2, P6, P9 | the same plus `product-scale`, every test included | 66/66 |
| 3.3 P8, P10 | `npm test` in full, incl. "every token is read by something" | 162/162 |
| 4.1 Workshop | `npx vitest run --project stories stories/brand stories/foundations`; `npm run typecheck`; `build-storybook` | 9 files, 18 stories pass (axe included, none skipped); typecheck 0; build 0. Bite: reverting the idle-spinner rule failed "Buttons"; removing the marker `rotate` failed "Placeholders And Marker"; both reverted |
| 5.1 Version, docs | `npm test`; the Archivo/stretch greps; the Bebas grep | 163/163 at that commit; greps print nothing |
| 6.1 Apps follow Epilogue (tokens, tests) | `npm test` | 166/166 |
| 6.2 Apps follow Epilogue (workshop, docs) | `npm test`; stories; the Archivo grep; `grep -c family=Archivo` | 167/167; 18/18; greps print nothing; 0 and 0 |
| 7.1 CI commands once, in CI's order | see `ci-commands.md` | every command exit 0; 167 tests (more than 147); stories 80 total, 0 failed, 0 pending (equal to Before); 44 packed files |
| 7.2 Diff audit, plan validation | below | as below |

## Diff audit (task 7.2)

```
$ git diff --stat d36d95c
 .storybook/preview-head.html                       |    5 +-
 README.md                                          |   15 +-
 checks/ci-commands.md                              |   13 +
 checks/pack-before.json                            |  236 +
 checks/stories-before.json                         |    1 +
 dist/brand.css                                     |   76 +-
 dist/kairos.css                                    |  138 +-
 dist/tokens.css                                    |   54 +-
 docs/adoption.md                                   |   80 +
 docs/decisions.md                                  |   44 +
 docs/kairos-ui.md                                  |    8 +-
 docs/preview.html                                  |    4 +-
 .../changes/brand-2026-epilogue/.openspec.yaml     |    2 +
 openspec/changes/brand-2026-epilogue/design.md     |  287 +
 openspec/changes/brand-2026-epilogue/proposal.md   |   58 +
 .../brand-2026-epilogue/specs/button/spec.md       |   14 +
 .../specs/kairos-design-apps-epilogue/spec.md      |   51 +
 .../specs/kairos-design-brand-parts/spec.md        |   66 +
 .../specs/kairos-design-brand-scale/spec.md        |   78 +
 .../specs/kairos-design-brand-tokens/spec.md       |   75 +
 .../specs/kairos-design-release-0-16/spec.md       |   25 +
 .../specs/kairos-design-release-0-18/spec.md       |   59 +
 openspec/changes/brand-2026-epilogue/tasks.md      |  296 +
 package-lock.json                                  |    4 +-
 package.json                                       |    2 +-
 stories/brand/Actions.stories.tsx                  |   21 +-
 stories/brand/Foundations.stories.tsx              |   86 +-
 stories/brand/Shell.stories.tsx                    |   24 +-
 stories/brand/Surfaces.stories.tsx                 |    7 +
 stories/foundations/Type.stories.tsx               |    6 +-
 tests/brand-parts.test.mjs                         |  162 +-
 tests/brand-scale.test.mjs                         |   92 +-
 tests/brand-tokens.test.mjs                        |   18 +-
 tests/contract.test.mjs                            |   19 +
 tests/fixtures/kairos-design-0.17.0/base.css       |   89 +
 tests/fixtures/kairos-design-0.17.0/brand.css      |  182 +
 tests/fixtures/kairos-design-0.17.0/kairos.css     | 6227 ++++++++++++++++++++
 tests/fixtures/kairos-design-0.17.0/tokens.css     |  761 +++
 tests/fixtures/website-reads.txt                   |  132 +
 tests/product-scale.test.mjs                       |  224 +-
 tests/release.test.mjs                             |   82 +-
 41 files changed, 9633 insertions(+), 190 deletions(-)

$ git diff --exit-code d36d95c -- dist/base.css dist/format dist/react bin .github
exit 0

$ git diff d36d95c -- tests/scale.test.mjs tests/emit.test.mjs tests/contrast.test.mjs
(bytes: 0)

$ git diff d36d95c -- tests/contract.test.mjs (removed lines, excluding the --- header)
0

$ node -p "require(./package.json).version"
0.18.0

$ manifest compare
manifest: same (ignored version)

$ grep -niE "archivo|stretch" dist/brand.css
(exit 1)
$ grep -rni "archivo" stories/brand
(exit 1)
$ grep -rn Bebas docs/kairos-ui.md docs/preview.html .storybook stories | grep -v -E :[0-9]+:\s*(//|/?\*)
(exit 1)
$ grep -rn Archivo dist stories .storybook README.md docs/kairos-ui.md docs/preview.html | grep -v -E 0\.1[678]
(exit 1)
$ grep -c family=Archivo docs/preview.html .storybook/preview-head.html
docs/preview.html:0
.storybook/preview-head.html:0
$ grep -c family=Epilogue docs/preview.html .storybook/preview-head.html
docs/preview.html:1
.storybook/preview-head.html:1
```

## Plan validation

In a copy under `$TMPDIR` with the `store:` line removed (`OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.16.0 validate brand-2026-epilogue --strict`):

```
Change 'brand-2026-epilogue' is valid
ℹ [INFO] kairos-design-brand-scale/spec.md: Archive would refuse this delta: kairos-design-brand-scale: target spec does not exist; only ADDED requirements are allowed for new specs. MODIFIED and RENAMED operations require an existing spec.
ℹ [INFO] kairos-design-brand-tokens/spec.md: Archive would refuse this delta: kairos-design-brand-tokens: target spec does not exist; only ADDED requirements are allowed for new specs. MODIFIED and RENAMED operations require an existing spec.
ℹ [INFO] kairos-design-release-0-16/spec.md: Archive would refuse this delta: kairos-design-release-0-16: target spec does not exist; only ADDED requirements are allowed for new specs. MODIFIED and RENAMED operations require an existing spec.
```

In place (the `store:` line only warns, because the directory is a real OpenSpec root):

```
Warning: /home/agent/studio/jobs/job-085/openspec/config.yaml declares store 'kairos-plans', but this directory is a real OpenSpec root; the declaration is ignored.
Change 'brand-2026-epilogue' is valid
ℹ [INFO] kairos-design-brand-scale/spec.md: Archive would refuse this delta: kairos-design-brand-scale: target spec does not exist; only ADDED requirements are allowed for new specs. MODIFIED and RENAMED operations require an existing spec.
ℹ [INFO] kairos-design-brand-tokens/spec.md: Archive would refuse this delta: kairos-design-brand-tokens: target spec does not exist; only ADDED requirements are allowed for new specs. MODIFIED and RENAMED operations require an existing spec.
ℹ [INFO] kairos-design-release-0-16/spec.md: Archive would refuse this delta: kairos-design-release-0-16: target spec does not exist; only ADDED requirements are allowed for new specs. MODIFIED and RENAMED operations require an existing spec.
```

## CHECK lines

54 scenarios and 54 CHECK lines across the seven spec files. Every named test exists as a top-level `test('<name>')` and passes in the full `npm test` (167/167). Every named story passes in `checks/stories-after.json`.

### button
- Rule: `tests/contract.test.mjs` › "a loadable button's spinner turns only while busy". Pass.
- Idle and busy in the workshop: `Brand/Actions` › "Buttons". Pass.

### kairos-design-apps-epilogue
- Product font stacks: `tests/brand-tokens.test.mjs` › "the font tokens name Epilogue and Courier Prime". Pass.
- One place for the family: `tests/brand-scale.test.mjs` › "brand.css sets no font family". Pass.
- No width anywhere: `tests/brand-scale.test.mjs` › "no stylesheet sets font-stretch". Pass.
- Case, weight and geometry kept: `tests/product-scale.test.mjs` › "0.17.0's Product type block is kept apart from its widths". Pass.
- Apps against 0.17.0 in the workshop: planner (computed-style compare). Not run here.
- Grep: the two greps in the audit above print nothing and `family=Archivo` counts are 0 and 0. Pass.
- Upgrading for apps: `tests/release.test.mjs` › "the docs tell apps to load Epilogue". Pass.

### kairos-design-brand-parts
- Label and footer rules: `tests/brand-parts.test.mjs` › "label ranks and the footer heading undo the heading capitals". Pass.
- On a heading in the workshop: `Brand/Shell` › "Header And Footer" and `Brand/Foundations` › "Type Ranks". Pass.
- Tilt rules: `tests/brand-parts.test.mjs` › "the title bar and the marker tilt with rotate, not transform". Pass.
- Tilt in the workshop: `Brand/Surfaces` › "Placeholders And Marker". Pass.
- Values read their own knobs: `tests/brand-parts.test.mjs` › "tick list values read their own size knobs". Pass.
- The statement list keeps its rank: `tests/brand-parts.test.mjs` › "the statement tick list keeps the statement rank". Pass.
- Text link documented: `tests/brand-parts.test.mjs` › "the text link wraps its label and arrow in one span". Pass.
- Wrapped in the workshop: `Brand/Actions` › "Links" passes; the browser check at 1366 and 390 is the planner's. Not run here.
- Phone menu rules: `tests/brand-parts.test.mjs` › "phone menu rows are 23px and the current one is underlined". Pass.
- Phone menu in the workshop: `Brand/Shell` › "Phone Menu". Pass.

### kairos-design-brand-scale
- Imported, not switched on: `tests/brand-scale.test.mjs` › "brand.css applies only under data-scale=brand on the root". Pass.
- Switched on in the workshop: `Brand/Actions` › "Buttons". Pass.
- Switched off again: `Brand/Actions` › "Without The Switch" (expects `none`). Pass.
- Values table: `tests/brand-scale.test.mjs` › "brand.css carries the brief's geometry, type and motion". Pass.
- Reduced motion still wins: `tests/brand-scale.test.mjs` › "brand.css leaves reduced motion at 1ms". Pass.
- Ranks at Brand Scale: `Brand/Foundations` › "Type Ranks". Pass.
- Ranks at Product Scale: `tests/brand-scale.test.mjs` › "every type rank has a Product Scale size from the 0.14 type scale". Pass.
- No width token: `tests/brand-scale.test.mjs` › "no width token is declared". Pass.
- No width rule in the brand layer: `tests/brand-scale.test.mjs` › "kairos.css sets font-stretch only in the apps' type block". Pass.
- Compact title: `tests/brand-parts.test.mjs` › "the compact title, card and time ranks read their tokens". Pass.
- Card heading and time line: `Brand/Foundations` › "Type Ranks". Pass.
- Documented: `tests/contract.test.mjs` › "every class has a manifest row, or a documented block". Pass.

### kairos-design-brand-tokens
- Old name, same value; A renamed role keeps its old name; A theme set below the root: the three named `tests/brand-tokens.test.mjs` tests. Pass.
- Font stacks: `tests/brand-tokens.test.mjs` › "at the Brand Scale the font tokens name Epilogue and Courier Prime". Pass.
- No font in the package: `tests/release.test.mjs` › "no font file, @font-face or font URL ships". Pass.
- The fixture is the published release; Every 0.14 declaration resolves the same; New rules on existing classes: the three named `tests/product-scale.test.mjs` tests (the last one also accepts `NEW_0_18`). Pass.
- base.css untouched: `git diff --exit-code d36d95c -- dist/base.css` exits 0 (audit above).
- The 0.17.0 fixture is the published release; Every 0.17.0 declaration resolves the same; New 0.18 rules on 0.17 classes: the three named `tests/product-scale.test.mjs` tests. Pass.

### kairos-design-release-0-16
- Docs present: `tests/release.test.mjs` › "the docs describe 0.16.0" (only the `tokensHeader` assertions deleted). Pass.
- No 0.14 family named: the Bebas grep prints nothing and `family=Epilogue` counts are 1 and 1 (audit above). Pass.
- Every light colour token keeps its swatch: `tests/brand-tokens.test.mjs` › "the Colour page groups every light colour token". Pass.

### kairos-design-release-0-18
- Version and exports: `tests/release.test.mjs` › "brand.css is exported and every 0.14 export is unchanged"; `node -p "require('./package.json').version"` prints `0.18.0`. Pass.
- Manifest otherwise unchanged: prints `manifest: same (ignored version)`. Pass.
- Pack list: `tests/release.test.mjs` › "the packed files are 0.14's plus AccountMenu (0.15.0) and brand.css"; `checks/pack-after.json` has 44 entries, 160,785 bytes (before 159,992). Pass.
- Names still declared: `tests/release.test.mjs` › "every name the website reads is still declared". Pass.
- The website's own check: planner. Not run here.
- Docs present: `tests/release.test.mjs` › "the docs describe 0.18.0". Pass.
- Brand files name no Archivo: both greps print nothing (audit above). Pass.
- Published, then tagged: planner, after the merge. Not run here.

## `NEW_0_18` entries

Exactly `design.md`'s table (8 rows, 12 property keys): every one exists in `dist/kairos.css` and none exists in the 0.17.0 fixture (checked with a one-off script, because "a new 0.18 rule…" does not fail on a listed entry that is missing). No entry was added beyond the table.

## Decisions and deviations

- "a new 0.18 rule on a 0.17.0 class is Brand-scoped or listed" has no stale-entry assertion. Task 2.1's check says that test must pass before the new rules exist, and a stale check would fail it then. The one-off script above covers it.
- The 0.17.0 tests read selectors with a top-level comma split (`splitTop`), because `:is(a, b)` lists contain ", " and a plain split cut them. The existing 0.14 tests are unchanged and still use a plain split.
- The `tokensHeader` assertions came out of "the docs describe 0.16.0" in the task 1.2 commit, not 2.1's (same file edit); no test failed in between.
- "Without The Switch" expects `none`, as the spec says.
- `tests/release.test.mjs` imports `parse` and `stripComments` from `tests/helpers/css.mjs` for the website-names test.

## Files changed

- `dist/tokens.css`: width tokens out, Epilogue stacks, 23px menu row, header and typefaces comment, new rank and tick-list defaults.
- `dist/brand.css`: width tokens out, lock revision 3 values, new ranks and tick-list values, no family, header.
- `dist/kairos.css`: 20 `font-stretch` declarations out (two whole rules), 3 more in the apps type block, new rank rules, P1, P2, P6, P8, P9, P10 rules.
- `package.json`, `package-lock.json`: `version` only.
- `README.md`, `docs/kairos-ui.md`, `docs/adoption.md`, `docs/decisions.md`, `docs/preview.html`, `.storybook/preview-head.html`: font links, fonts text, upgrade guide, decisions, manifest rows.
- `stories/brand/*`, `stories/foundations/Type.stories.tsx`: the assertions of `design.md` › Workshop. No story export added or removed.
- `tests/`: new and edited tests, `tests/fixtures/kairos-design-0.17.0/`, `tests/fixtures/website-reads.txt`.
- `openspec/changes/brand-2026-epilogue/tasks.md`: ticks only. `checks/`: this evidence.

## Not run in the sandbox

- Planner-owned CHECKs: computed-style compare of apps against 0.17.0, browser checks at 1366 and 390 (text link underline, wipe over the tilt, phone menu current row, Brand stories against `shots/rev3-*`), the website's own package test, the registry checks and the publish.
- No screenshot or browser check beyond `test-stories`.
