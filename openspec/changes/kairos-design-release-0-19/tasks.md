# Tasks: kairos-design-release-0-19

Work in this order and commit after each group. Use npm, not yarn, on Node 24 if the sandbox has it (CI's version), otherwise Node 22.12 or later. Write check output where a task says (`checks/…`) and commit it with `git add -f checks`.

Values and names come from `design.md` (Decided, Product Scale after this change, Guards, Tests that change, Workshop, Docs).

Shipped files may change only where a task says. Never edit:

- `dist/brand.css`, `dist/base.css`, `dist/format/`, `dist/react/`, `bin/`;
- `.github/`, `openspec/config.yaml`;
- any `package.json` field other than `version`.

Add no dependency. While working, run only the test files a task names; the full suites run once, in group 6.

## 1. Baseline and the 0.18.0 guard

- [x] 1.1 Record the baseline on the untouched checkout (`725c182`), in this order:

    - `npm ci`
    - `npx playwright install --with-deps chromium`
    - `npm test` (note the totals)
    - `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json`
    - `npm pack --dry-run --json --ignore-scripts > checks/pack-before.json`

    Write the totals into `checks/ci-commands.md` under "Before". Expected from the planner's run and the 0.18.0 review: `npm test` 167 pass, 0 fail; 80 stories in 21 files, all passing; 44 packed files, 160,785 bytes. Record any failing story and carry on.

    Covers: the before figures that kairos-design-release-0-19 › "Pack list" and the group 6 counts compare against.

    Check: all five commands complete and the figures are recorded.

- [x] 1.2 Build the 0.18.0 guard (`design.md` › Guards).

    - Copy `dist/tokens.css`, `dist/base.css`, `dist/kairos.css` and `dist/brand.css` from `725c182` into `tests/fixtures/kairos-design-0.18.0/` byte for byte (`git show 725c182:dist/<file> > …`).
    - In `tests/product-scale.test.mjs`, add `FIXTURE_0_18`, `OLD_0_18`, the constants `SOFT_0_19`, `CHANGED_0_19`, `PHONE_0_19` and `NEW_0_19` exactly as `design.md` gives them, and the four tests "the 0.18.0 fixture is the published 0.18.0", "every 0.18.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.19 lists", "a new 0.19 rule on a 0.18.0 class is Brand-scoped or listed" and "tokens.css adds only the phone type rule to its width queries".
    - Update the file's header comment to name 0.14, 0.17.0 and 0.18.0.

    Covers: kairos-design-brand-tokens › "The 0.18.0 fixture is the published release", "Every 0.18.0 declaration resolves the same", "New 0.19 rules on 0.18 classes", "Width-scoped token rules".

    Check:

    - With `CHANGED_0_19` and `PHONE_0_19` emptied for one run, the four 0.18.0 tests pass on the untouched code (0.18.0 against itself) and fail once you change one value by hand in `dist/kairos.css`, and again once you add a `@media screen and (max-width: 899px) { :root { --kairos-text-body: 1rem; } }` rule to `dist/tokens.css`. Try both, then revert.
    - With the lists in place, "every 0.18.0 declaration resolves the same…" and "tokens.css adds only the phone type rule…" fail until groups 2 and 3 are done; that is expected.
    - `node --test tests/product-scale.test.mjs` passes every 0.14 and 0.17.0 test.

## 2. Phone type

- [x] 2.1 Apply Decided 2-5.

    - `dist/tokens.css`: add the phone rule of Decided 5, with its comment, after the existing `@media (max-width: 899px)` site-header block. Change no other value.
    - Create `tests/product-type-and-stamp.test.mjs` with "below 900px body text is 16px and button labels 14px and 13px", "from 900px body text and button labels keep their 0.18.0 sizes" and "the Brand Scale keeps its body and button sizes on phones" (`design.md` › Tests that change). Top-level `test()`, no `describe`.
    - `docs/kairos-ui.md`: the type table edits (`design.md` › Docs).

    Covers: kairos-design-product-scale › "Phone sizes", "Desktop sizes kept", "Brand outranks the phone rule"; kairos-design-brand-tokens › "Width-scoped token rules".

    Check: `node --test tests/product-type-and-stamp.test.mjs tests/product-scale.test.mjs tests/scale.test.mjs tests/brand-scale.test.mjs tests/contract.test.mjs` passes, apart from "every 0.18.0 declaration resolves the same…", which waits for group 3.

## 3. The stamp only on rank-1 buttons

- [ ] 3.1 Apply Decided 6-13.

    - `dist/tokens.css`:
        - add `--kairos-shadow-stamp` and `--kairos-shadow-stamp-hover` beside `--kairos-shadow-pressed` in the light block, and remove `--kairos-shadow`, `--kairos-shadow-card` and `--kairos-shadow-lg` from it;
        - declare those three in the alias block after `--kairos-shadow-press`, each `var(--kairos-shadow-soft-card)`;
        - point `--kairos-button-shadow-rest` and `--kairos-button-shadow-hover` at the two stamp tokens (`-active` keeps `--kairos-shadow-pressed`);
        - rewrite the stamp comments (Decided 13).
    - `dist/kairos.css`: the three custom properties of `.kairos-page-header-primary` (Decided 10), and the comments of Decided 13. No other declaration.
    - `tests/product-scale.test.mjs`: the two `CHANGED_0_19` lookups in "every 0.14 declaration resolves the same…" and in "every 0.17.0 declaration resolves the same…" (`design.md` › The 0.14 and 0.17.0 guards learn the same list).
    - `tests/brand-tokens.test.mjs`: the six `LISTED` entries. No other edit.
    - `tests/product-type-and-stamp.test.mjs`: add "only rank-1 buttons wear the ink stamp at the Product Scale", "surfaces wear the soft card shadow at the Product Scale" and "the page header's primary reads the button stamp knobs".
    - `docs/kairos-ui.md`: the stamp section and the panel, disclosure-group and card--soft rows (`design.md` › Docs).

    Covers:

    - kairos-design-product-scale › "Ink offsets only on rank 1", "The page header's primary reads the knobs", "Soft surfaces";
    - kairos-design-brand-tokens › "Old name, same value", "A renamed role keeps its old name", "A theme set below the root", "Every 0.14 declaration resolves the same", "New rules on existing classes", "Every 0.17.0 declaration resolves the same", "New 0.18 rules on 0.17 classes", "Every 0.18.0 declaration resolves the same", "New 0.19 rules on 0.18 classes".

    Check: `npm test` passes in full, including `tests/scale.test.mjs` › "every token is read by something" and "every shadow comes from the stamp tokens", with `tests/scale.test.mjs`, `tests/contrast.test.mjs` and `tests/contract.test.mjs` unedited.

## 4. Workshop

- [ ] 4.1 Do `design.md` › Workshop:

    - `stories/foundations/Type.stories.tsx`: the Scale note and the new "Phone Sizes" story;
    - `stories/foundations/Geometry.stories.tsx`: the stamp and surfaces sections, the ledes, and the new "Elevation" story.

    Keep every existing story export. Use `getComputedStyle` (or `style()` from `../brand/computed`) and `expect` from `storybook/test`. "Phone Sizes" sets `globals: { viewport: { value: 'narrow' } }` (419px) and asserts 16px, 14px and 13px; no other story names a viewport or asserts anything width-dependent, and none asserts a hover or text width. Then run `npx vitest run --project stories stories/foundations stories/brand`.

    Covers: kairos-design-product-scale › "Phone sizes in the workshop", "Elevation in the workshop"; kairos-design-brand-scale › "Soft shadows replace the stamp" (Brand/Surfaces › "Cards And Bands", unedited).

    Check:

    - Every Foundations and Brand story passes with axe and none is skipped; Brand/Actions › "Without The Switch" passes unedited.
    - `npm run typecheck` exits 0.
    - `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` exits 0.

    A story that fails axe is a finding: block the card with the story, the rule and the element rather than change a token value.

## 5. Release and docs

- [ ] 5.1 Set the version and write the docs.

    - Set `package.json` › `version` to `0.19.0`, and the two top `version` fields of `package-lock.json` (the root `version` and `packages[""].version`) to match. Change nothing else in either file.
    - Write `design.md` › Docs: "Upgrading to 0.19.0" in `docs/adoption.md` above "Upgrading to 0.18.0", the 0.19.0 section at the end of `docs/decisions.md`, and any `docs/kairos-ui.md` edit not yet done. Earlier sections of both files are history and stay.
    - Add "the docs describe 0.19.0" to `tests/release.test.mjs`, shaped as "the docs describe 0.18.0" (the section between the "Upgrading to 0.19.0" heading and the next heading of its level), asserting the needles of kairos-design-release-0-19 › "Docs present". No test asserts the version literal.

    Covers:

    - kairos-design-release-0-19 › "Version and exports", "Docs present", "Names still declared";
    - the earlier docs tests "the docs describe 0.16.0", "the docs describe 0.18.0" and "the docs tell apps to load Epilogue", which must still pass.

    Check: `npm test` passes.

## 6. Final checks

- [ ] 6.1 Fresh install, then CI's commands once, in CI's order:

    - `rm -rf node_modules storybook-static && npm ci`
    - `npm test`
    - `npm run typecheck`
    - `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook`
    - `npx playwright install --with-deps chromium`
    - `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-after.json`
    - `npm pack --dry-run --json --ignore-scripts > checks/pack-after.json`

    Record each exit code and total under "After" in `checks/ci-commands.md`, beside "Before", plus `wc -c dist/kairos.css dist/tokens.css` and `gzip -9 -c dist/kairos.css | wc -c`.

    Covers:

    - kairos-design-release-0-19 › "Pack list";
    - kairos-design-brand-tokens › "The fixture is the published release", "The 0.17.0 fixture is the published release";
    - every story scenario of task 4.1.

    Check:

    - Every command exits 0.
    - `npm test` has 0 failed and more tests than 167.
    - Stories: `numFailedTests` 0, `numPendingTests` 0, `numTotalTests` equal to "Before" plus 2.
    - 44 packed files.

- [ ] 6.2 Diff audit and plan validation, written into `checks/REPORT.md`. Run and record:

    - `git diff --stat 725c182`;
    - `git diff --exit-code 725c182 -- dist/brand.css dist/base.css dist/format dist/react bin .github` (exit 0);
    - `git diff 725c182 -- tests/scale.test.mjs tests/emit.test.mjs tests/contrast.test.mjs tests/contract.test.mjs tests/brand-scale.test.mjs tests/brand-parts.test.mjs` (empty);
    - `git diff 725c182 -- dist/kairos.css` (only the three `.kairos-page-header-primary` lines and comment lines);
    - `node -p "require('./package.json').version"` (prints `0.19.0`) and `node -p "const l=require('./package-lock.json'); l.version+' '+l.packages[''].version"` (prints `0.19.0 0.19.0`);
    - a `node -e` compare of `package.json` with `git show 725c182:package.json`, ignoring `version`, that prints `manifest: same (ignored version)`.

    Then validate the plan. `OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.16.0 validate kairos-design-release-0-19 --strict` stops on the `kairos-plans` store named in `openspec/config.yaml`. Run it in a copy of the repository under `$TMPDIR` with the `store:` line deleted from the copy's `openspec/config.yaml`; don't edit the real file. "Archive would refuse" INFO lines there are expected: the store holds the main specs.

    Finish `checks/REPORT.md` with:

    - each task, its check and its result;
    - every CHECK line of the five spec files under `specs/` (brand-scale, brand-tokens, product-scale, release-0-18, release-0-19), with its test or command and result (planner-owned ones marked "planner");
    - every file changed, with its reason;
    - anything not run in the sandbox.

    Covers:

    - kairos-design-brand-tokens › "base.css untouched";
    - kairos-design-product-scale › "brand.css untouched";
    - kairos-design-release-0-19 › "Version and exports" (version), "Manifest otherwise unchanged".

    Check: each command prints what this task says, and validation prints that the change is valid.

## Workflow follow-up

Planner work, not builder tasks. The repository has no `qa` branch.

- **Review.** Read the builder's whole summary, then rerun in a throwaway sandbox with `review_rerun.py`:
    - `REVIEW_SKIP=install,lint,typecheck,test,build,opennext`;
    - extras built with `json.dumps`: `npm-ci`, `npm-test`, `npm-typecheck`, `workshop`, `chromium`, `stories` (JSON), `pack`, `spec-validate` in a store-less copy, and `show-tests` (node junit per file).

    Then:

    - match every CHECK name against the passing tests and stories;
    - count `#### Scenario` against `- **CHECK**` per spec;
    - confirm the 0.18.0 fixture's sha256 values against the npm tarball again;
    - read `git diff 725c182 -- dist/` line by line against `design.md` › Decided.
- **Before/after workshop compare** (kairos-design-product-scale › "Before and after in the workshop"), in the review sandbox, `cdp('Page.bringToFront')` first:
    - build the workshop twice, once as it is and once with the 0.18.0 fixture CSS swapped into `.storybook/preview.tsx`'s imports, in `/tmp`;
    - for Components/Button, Forms, Overlays (dialog, popover, menus opened), Feedback (toast), Density › "Related Sections", Screens/Record list and Sign in, and every Brand story: freeze animations, then dump the computed `font-size`, `line-height`, `box-shadow` and box size of every visible element at 390, 820 and 1366, light and dark, and diff per element;
    - expected: below 900px, font sizes reading the body step 14 → 16px and button labels 12 → 14px (small 11 → 13px), with the line heights and box sizes that follow from those sizes; at every width, the box shadows of the ten surfaces; nothing else at the Product Scale; nothing in the Brand stories that switch the Brand Scale on (Brand/Actions › "Without The Switch" is Product Scale and shows the phone label size);
    - any other difference is a finding;
    - take the same stories' before/after shots at 390 and 1366 (light; dark for Record list) into one contact sheet, plus a panel with its heading and body text at 390 (headings and body are both 16px on phones, `design.md` › Risks), for the reviewer to see on the release message.
- **Store and pull request.**
    - Run `npm view kairos-design versions --json` and `git log 725c182..origin/main`. If 0.19.0 is taken or `main` moved, rebase and take the next minor (`npm-package-release.md` › Later versions).
    - Copy this change into `kairos-plans` as `kairos-design-release-0-19` and validate it there with `--strict`. Archive it in a scratch copy of the store, then `validate --all --strict`. Fix any 500-character overflow in the merged specs as wording only.
    - On the branch, `git rm -r --cached checks openspec/changes/kairos-design-release-0-19` in a "Drop plan and build evidence from the PR" commit. `git diff origin/main --name-only | grep -E '^(checks|openspec/changes)/'` must print nothing.
    - Push `release/0.19`, open one PR into `main` naming the change and plan id, and wait for green CI.
- **Merge = publish 0.19.0**, covered by the reviewer's "Yes publish" (18 November 2026). Right before `gh pr merge`, re-read `npm view kairos-design dist-tags versions --json` and `git ls-remote origin refs/heads/main`. Then kairos-design-release-0-19 › "Published, then tagged":
    - `gh run watch <id> --exit-status`, with Publish before the tag step in the log;
    - poll the registry every 30 s for up to 15 min;
    - the tarball has 44 files;
    - `git ls-remote --tags origin v0.19.0`;
    - `npm view kairos-design@^0.18.0 version` prints 0.18.0.

    Then the install test from npm (`npm-package-release.md` section 5 step 6, with `radix-ui@1 @tanstack/react-table@9`).

- **Archive and follow-on.** Archive `kairos-design-release-0-19` in the store (`openspec archive`, then `validate --all --strict`; fix any `TBD` Purpose) and log the PR, run ids and results. Tell the Paykit redesign session that 0.19.0 is on npm: `paykit-redesign-shell` pins it and drops its local override file. Mailkit, Account, Card, Uptime, aikit and the website repin only in their own plans.
