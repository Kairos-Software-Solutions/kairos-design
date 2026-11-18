# Tasks: brand-2026-epilogue

Work in this order and commit after each group. Use npm, not yarn, on Node 24 if the sandbox has it (CI's version), otherwise Node 22.12 or later. Write check output where a task says (`checks/…`) and commit it with `git add -f checks`.

The look comes from Kairos design brief v3, lock revision 3, in `input/brief/`. Values and names come from `design.md` (Decided, Brand Scale, Apps against 0.17.0, Tests that change, Workshop, Docs).

Shipped files may change only where a task says. Never edit:
- `dist/base.css`, `dist/format/`, `dist/react/`, `bin/`;
- `.github/`, `openspec/config.yaml`;
- any `package.json` field other than `version`.

Add no dependency. While working, run only the test files a task names; the full suites run once, in group 7.

## 1. Baseline and guards

- [ ] 1.1 Record the baseline on the untouched checkout (`d36d95c`), in this order:
  - `npm ci`
  - `npx playwright install --with-deps chromium`
  - `npm test` (note the totals)
  - `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-before.json`
  - `npm pack --dry-run --json --ignore-scripts > checks/pack-before.json`

  Write the totals into `checks/ci-commands.md` under "Before". Expected from the planner's run:
  - `npm test` 147 pass, 0 fail;
  - 44 packed files, 159,992 bytes;
  - stories were not run by the planner. `Brand/Actions` › "Without The Switch" is expected to fail on 0.17.0, because it still asserts an uppercase button. Record every failing story and carry on.

  Covers: the before figures that kairos-design-release-0-18 › "Pack list" and the group 7 counts compare against. Check: all five commands complete and the figures are recorded.
- [ ] 1.2 Build the 0.17.0 guard and the website-names check.
  - Copy `dist/tokens.css`, `dist/base.css`, `dist/kairos.css` and `dist/brand.css` from `d36d95c` into `tests/fixtures/kairos-design-0.17.0/` byte for byte.
  - In `tests/product-scale.test.mjs`, add "the 0.17.0 fixture is the published 0.17.0", "every 0.17.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.18 lists" and "a new 0.18 rule on a 0.17.0 class is Brand-scoped or listed", with the constants `GONE_0_18`, `CHANGED_0_18` and `NEW_0_18` exactly as `design.md` › Apps against 0.17.0 gives them (core lists only).
  - Make the existing "a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale" also accept `NEW_0_18` entries, as it accepts `NEW_0_17`. Change nothing else in that file.
  - Copy `input/website-reads.txt` to `tests/fixtures/website-reads.txt`. Add "every name the website reads is still declared" to `tests/release.test.mjs` (`design.md` › Tests that change).

  Covers:
  - kairos-design-brand-tokens › "The 0.17.0 fixture is the published release", "Every 0.17.0 declaration resolves the same", "New 0.18 rules on 0.17 classes", "New rules on existing classes";
  - kairos-design-release-0-18 › "Names still declared".

  Check:
  - With the three 0.18 lists emptied for one run, the three 0.17.0 tests pass on the untouched code (0.17.0 against itself) and fail once you change one value in `dist/kairos.css` by hand. Try it, then revert both.
  - With the lists in place, "every 0.17.0 declaration resolves the same…" fails until task 3.2; that is expected.
  - `node --test tests/release.test.mjs` passes.

## 2. Brand fonts, lock revision 3 type, no width

- [ ] 2.1 Apply Decided 2, 3, 4 and 16 and `design.md` › Brand Scale, without the new ranks and tick knobs (group 3 adds those).
  - `dist/tokens.css`:
    - delete the 16 `-stretch` tokens;
    - set `--kairos-site-menu-row-size` to 23px;
    - rewrite the header's source line and the typefaces comment.
  - `dist/brand.css`:
    - add the two family tokens;
    - delete every `-stretch` token;
    - set the lock revision 3 rank values and the display phone size;
    - rewrite the header and comments with no width (a comment may not say "stretch").
  - `dist/kairos.css`: delete the 20 `font-stretch` declarations `GONE_0_18` lists, which removes the two Brand-scoped rules that held only a width. Leave the 0.17.0 apps type block alone.
  - `tests/brand-scale.test.mjs`:
    - `RANKS` loses its width column and takes the new values;
    - `TABLE` follows `brand.css`;
    - add "no width token is declared" and "kairos.css sets font-stretch only in the apps' type block".
  - `tests/brand-tokens.test.mjs`: add "at the Brand Scale the font tokens name Epilogue and Courier Prime".
  - `tests/release.test.mjs` › "the docs describe 0.16.0": delete only the `tokensHeader` assertions.

  Covers:
  - kairos-design-brand-tokens › "Font stacks", "No font in the package", "Old name, same value", "A renamed role keeps its old name", "A theme set below the root";
  - kairos-design-brand-scale › "Imported, not switched on", "Values table", "Reduced motion still wins", "Ranks at Product Scale", "No width token", "No width rule in the brand layer";
  - kairos-design-release-0-16 › "Docs present".

  Check:
  - `node --test tests/brand-scale.test.mjs tests/brand-tokens.test.mjs tests/contract.test.mjs tests/release.test.mjs tests/contrast.test.mjs tests/emit.test.mjs` passes.
  - Every `tests/scale.test.mjs` test passes.
  - In `tests/product-scale.test.mjs` only "every 0.17.0 declaration resolves the same…" may still fail, on the marker's `transform` alone.

## 3. QA package fixes (P1-P6, P8-P10; P7 dropped)

- [ ] 3.1 P3, P4 and P5 (Decided 5, 6, 7 and 15).
  - Add the Product Scale defaults to `tokens.css` and the Brand values to `brand.css` (`design.md` › Brand Scale table).
  - Add the `kairos.css` rules: `.kairos-type-title--compact` after `.kairos-type-title`, `.kairos-type-card`, `.kairos-type-card--sm` and `.kairos-type-time`, each its own block.
  - Name the four classes in the `docs/kairos-ui.md` type-rank row and drop "width" from it.
  - Add the new rows to `TABLE` in `tests/brand-scale.test.mjs`.
  - In `tests/brand-parts.test.mjs`, add "the compact title, card and time ranks read their tokens" (it also asserts that `docs/kairos-ui.md` names `kairos-type-title--compact` and `kairos-type-card--sm`, which the manifest check skips because they contain `--`) and add the three new rank classes to "every shared part from the brief has its class".

  Covers:
  - kairos-design-brand-scale › "Compact title", "Documented", "Values table", "Ranks at Product Scale".

  Check: `node --test tests/brand-parts.test.mjs tests/brand-scale.test.mjs tests/contract.test.mjs tests/scale.test.mjs` passes.
- [ ] 3.2 P1, P2, P6 and P9 (Decided 10, 11, 8 and 13).
  - P1: in `kairos.css`, add `text-transform: none` to `.kairos-type-label, .kairos-type-price`, and the three declarations to `.kairos-site-footer-heading`.
  - P2: add `rotate` to `.kairos-title-bar::after`, and swap the marker's `transform` for `rotate`.
  - P6: add the three tick-list knobs to `tokens.css` (defaults) and `brand.css` (values, plus `TABLE` rows). Make `.kairos-tick-list-value` read them, add its 520px phone rule, and add the statement-list rule after it.
  - P9: add the current-row rule after `.kairos-site-menu-row`. Add the current row to the `docs/kairos-ui.md` site-menu row.
  - In `tests/brand-parts.test.mjs`, add "label ranks and the footer heading undo the heading capitals", "the title bar and the marker tilt with rotate, not transform", "tick list values read their own size knobs", "the statement tick list keeps the statement rank" and "phone menu rows are 23px and the current one is underlined".

  Covers:
  - kairos-design-brand-parts › "Label and footer rules", "Tilt rules", "Values read their own knobs", "The statement list keeps its rank", "Phone menu rules";
  - kairos-design-brand-tokens › "Every 0.17.0 declaration resolves the same", "New 0.18 rules on 0.17 classes".

  Check: `node --test tests/brand-parts.test.mjs tests/brand-scale.test.mjs tests/product-scale.test.mjs tests/contract.test.mjs tests/scale.test.mjs` passes, every `product-scale` test included.
- [ ] 3.3 P8 and P10 (Decided 12 and 14).
  - Add `.kairos-text-link-text` to `kairos.css` and rewrite the `docs/kairos-ui.md` text-link row as `design.md` gives it.
  - Add the idle-spinner rule after `.kairos-button[aria-busy='true'] .kairos-button-pending`.
  - Add "the text link wraps its label and arrow in one span" to `tests/brand-parts.test.mjs`, plus `kairos-text-link-text` to "every shared part from the brief has its class".
  - Add "a loadable button's spinner turns only while busy" to `tests/contract.test.mjs`, without editing its existing tests.

  Covers:
  - kairos-design-brand-parts › "Text link documented";
  - button › "Rule";
  - kairos-design-brand-tokens › "New rules on existing classes", "Every 0.14 declaration resolves the same", "New 0.18 rules on 0.17 classes".

  Check: `npm test` passes in full, including `tests/scale.test.mjs` › "every token is read by something".

## 4. Workshop

- [ ] 4.1 Do `design.md` › Workshop:
  - the font link in `.storybook/preview-head.html` and `docs/preview.html` (Decided 17);
  - the story edits in `stories/brand/` ("Type Ranks", "Buttons", "Links", "Without The Switch", "Header And Footer", "Phone Menu", "Placeholders And Marker");
  - "The families" in `stories/foundations/Type.stories.tsx`.

  Keep every story export. Use `getComputedStyle`, `expect` and `userEvent` from `storybook/test`; no hover, no assertions on text width or the viewport. Then run `npx playwright install --with-deps chromium` and `npx vitest run --project stories stories/brand stories/foundations`.

  Covers:
  - kairos-design-brand-scale › "Switched on in the workshop", "Switched off again", "Ranks at Brand Scale", "Card heading and time line";
  - kairos-design-brand-parts › "On a heading in the workshop", "Tilt in the workshop", "Wrapped in the workshop", "Phone menu in the workshop";
  - button › "Idle and busy in the workshop".

  Check:
  - Every Brand and Foundations story passes with axe and none is skipped.
  - `npm run typecheck` exits 0.
  - `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` exits 0.

  A story that fails axe on a token pair is a finding about the token: block the card with the pair and its ratio rather than change a brief value.

## 5. Release and docs

- [ ] 5.1 Set the version and write the docs.
  - Set `package.json` › `version` to `0.18.0`, and the two top `version` fields of `package-lock.json` to match. Change nothing else in either file.
  - Add "the docs describe 0.18.0" to `tests/release.test.mjs` (kairos-design-release-0-18 › "Docs present"; no test asserts the version literal).
  - Write `design.md` › Docs (core text): the 0.18.0 section of `docs/decisions.md`, "Upgrading to 0.18.0" in `docs/adoption.md` with Decided 18's line, README › Fonts and its Brand row, and any `docs/kairos-ui.md` row not yet done.
  - Earlier sections of `docs/decisions.md` and `docs/adoption.md` are history and stay.

  Covers:
  - kairos-design-release-0-18 › "Version and exports", "Docs present", "Brand files name no Archivo";
  - kairos-design-release-0-16 › "Docs present", "No 0.14 family named", "Every light colour token keeps its swatch".

  Check:
  - `npm test` passes.
  - `grep -niE "archivo|stretch" dist/brand.css` and `grep -rni "archivo" stories/brand` print nothing.
  - `grep -rn "Bebas" docs/kairos-ui.md docs/preview.html .storybook stories | grep -v -E ':[0-9]+:\s*(//|/?\*)'` prints nothing.

## 6. Apps follow Epilogue (separable: the reviewer's call)

- [ ] 6.1 Do `design.md` › Apps follow Epilogue, steps 1-4:
  - `tokens.css` names the Epilogue stack for `--kairos-display` and `--kairos-body`, and its typefaces comment says so;
  - `brand.css` deletes its two family lines;
  - the three `font-stretch` declarations of the apps type block (`kairos.css:6158-6182`) go, every other declaration there stays, and the block's comments drop "Archivo" and "wide". A comment line that still names Archivo as history must name its release (0.16, 0.17 or 0.18) on the same line, or task 6.2's grep flags it; the same goes for `tokens.css`.

  Then the tests:
  - `tests/product-scale.test.mjs`: the `INTENTIONAL` font values, the group 6 additions to `CHANGED_0_18` and `GONE_0_18`, and "0.17.0's Product type block is kept apart from its widths";
  - `tests/brand-scale.test.mjs`: delete the font rows from `TABLE`; add "brand.css sets no font family" and "no stylesheet sets font-stretch";
  - `tests/brand-tokens.test.mjs`: rename "the font tokens name Archivo and Courier Prime" to "the font tokens name Epilogue and Courier Prime" and expect the Epilogue stack.

  Covers:
  - kairos-design-apps-epilogue › "Product font stacks", "One place for the family", "No width anywhere", "Case, weight and geometry kept";
  - kairos-design-brand-tokens › "Font stacks", "Every 0.14 declaration resolves the same", "Every 0.17.0 declaration resolves the same".

  Check: `npm test` passes in full.
- [ ] 6.2 Do `design.md` › Apps follow Epilogue, step 5:
  - drop Archivo from the font links in `.storybook/preview-head.html` and `docs/preview.html`;
  - make "The families" on the Type page name Epilogue only;
  - make README › Fonts name Epilogue for every surface;
  - in `docs/kairos-ui.md`, drop "(Archivo)" from line 91;
  - in `docs/adoption.md`, replace Decided 18's line with the apps paragraph (`design.md` › Docs);
  - add the apps paragraph to the 0.18.0 section of `docs/decisions.md`;
  - add "the docs tell apps to load Epilogue" to `tests/release.test.mjs`.

  Covers:
  - kairos-design-apps-epilogue › "Grep", "Upgrading for apps";
  - kairos-design-release-0-16 › "No 0.14 family named".

  Check:
  - `npm test` passes.
  - `npx vitest run --project stories stories/brand stories/foundations` passes.
  - `grep -rn "Archivo" dist stories .storybook README.md docs/kairos-ui.md docs/preview.html | grep -v -E '0\.1[678]'` prints nothing.
  - `grep -c "family=Archivo" docs/preview.html .storybook/preview-head.html` prints 0 for each.

## 7. Final checks

- [ ] 7.1 Fresh install, then CI's commands once, in CI's order:
  - `rm -rf node_modules storybook-static && npm ci`
  - `npm test`
  - `npm run typecheck`
  - `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook`
  - `npx playwright install --with-deps chromium`
  - `npx vitest run --project stories --reporter=default --reporter=json --outputFile=checks/stories-after.json`
  - `npm pack --dry-run --json --ignore-scripts > checks/pack-after.json`

  Record each exit code and total under "After" in `checks/ci-commands.md`, beside "Before".

  Covers:
  - kairos-design-release-0-18 › "Pack list";
  - kairos-design-brand-tokens › "The fixture is the published release";
  - every story scenario of task 4.1.

  Check:
  - Every command exits 0.
  - `npm test` has 0 failed and more tests than 147.
  - Stories: `numFailedTests` 0, `numPendingTests` 0, `numTotalTests` equal to "Before".
  - 44 packed files.
- [ ] 7.2 Diff audit and plan validation, written into `checks/REPORT.md`. Run and record:
  - `git diff --stat d36d95c`;
  - `git diff --exit-code d36d95c -- dist/base.css dist/format dist/react bin .github` (exit 0);
  - `git diff d36d95c -- tests/scale.test.mjs tests/emit.test.mjs tests/contrast.test.mjs` (empty);
  - `git diff d36d95c -- tests/contract.test.mjs` (additions only);
  - `node -p "require('./package.json').version"` (prints `0.18.0`);
  - a `node -e` compare of `package.json` with `git show d36d95c:package.json`, ignoring `version`, that prints `manifest: same (ignored version)`;
  - the greps of tasks 5.1 and 6.2;
  - `grep -c "family=Epilogue" docs/preview.html .storybook/preview-head.html` (1 each).

  Then validate the plan. `OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.16.0 validate brand-2026-epilogue --strict` stops on the `kairos-plans` store named in `openspec/config.yaml`. Run it in a copy of the repository under `$TMPDIR` with the `store:` line deleted from the copy's `openspec/config.yaml`; don't edit the real file. "Archive would refuse" INFO lines there are expected: the store holds the main specs.

  Finish `checks/REPORT.md` with:
  - each task, its check and its result;
  - every CHECK line of the seven spec files, with its test or command and result (planner-owned ones marked "planner");
  - every `NEW_0_18` entry beyond `design.md`'s table, with its reason;
  - every file changed, with its reason;
  - anything not run in the sandbox.

  Covers:
  - kairos-design-brand-tokens › "base.css untouched";
  - kairos-design-release-0-18 › "Version and exports" (version), "Manifest otherwise unchanged", "Brand files name no Archivo";
  - kairos-design-release-0-16 › "No 0.14 family named";
  - kairos-design-apps-epilogue › "Grep".

  Check: each command prints what this task says, and validation prints that the change is valid.

## Workflow follow-up

Planner work, not builder tasks. The repository has no `qa` branch.

- **Review.** Read the builder's whole summary, then rerun in a throwaway sandbox with `review_rerun.py`:
  - `REVIEW_SKIP=install,lint,typecheck,test,build,opennext`;
  - extras built with `json.dumps`: `npm-ci`, `npm-test`, `npm-typecheck`, `workshop`, `chromium`, `stories` (JSON), `pack`, `spec-validate` in a store-less copy, and `show-tests` (node junit per file).

  Then:
  - match every CHECK name against the passing tests and stories;
  - count `#### Scenario` against `- **CHECK**` per spec;
  - judge each `NEW_0_18` entry the builder added;
  - confirm the 0.17.0 fixture's sha256 values again.
- **Browser checks** on the built workshop at 1366 and 390, `cdp('Page.bringToFront')` first:
  - kairos-design-brand-parts › "Wrapped in the workshop": the words are underlined and the arrow has no underline of its own, judged against the reference page's text link.
  - The title bar and marker tilt during and after a `transform: scaleX()` wipe applied in the page.
  - The phone menu's current row.
  - Brand stories against `shots/rev3-*` and a computed-style compare against `reference/index.html`, `about.html`, `contact.html` and `services-website.html`: display, title, compact title (Contact), h2, h3, card heading, time line, label, footer heading, tick values, phone menu rows. Compare font, size, weight, `font-stretch`, line height and tracking.
  - kairos-design-apps-epilogue › "Apps against 0.17.0 in the workshop": Product Scale stories built with the 0.17.0 fixture CSS against 0.18.0.
- **Website pre-release** (kairos-design-release-0-18 › "The website's own check"). After task 6.1 (after 3.3 if group 6 is dropped), run `scripts/pack_prerelease.sh <this job> <commit> 0.18.0 <website job> <its design.md>`. Then run the website's `tests/kairos-design.test.ts` against that tarball, and confirm the names of its decisions 3, 42 and 43 before its card starts.
- **Store and pull request.**
  - Run `npm view kairos-design versions --json` and `git log d36d95c..origin/main`. If 0.18.0 is taken or `main` moved, rebase and take the next minor (`npm-package-release.md` › Later versions).
  - Copy this change into `kairos-plans` as `kairos-design-brand-2026-epilogue` and validate it there with `--strict`. Archive it in a scratch copy of the store, then `validate --all --strict`. Fix any 500-character overflow in the merged specs as wording only.
  - On the branch, `git rm -r --cached checks openspec/changes/brand-2026-epilogue` in a "Drop plan and build evidence from the PR" commit. `git diff origin/main --name-only | grep -E '^(checks|openspec/changes)/'` must print nothing.
  - Push `change/brand-2026-epilogue`, open one PR into `main` naming the change and plan id, and wait for green CI.
- **Merge = publish 0.18.0** (SUMMARY › Needs your call). Then kairos-design-release-0-18 › "Published, then tagged":
  - `gh run watch <id> --exit-status`, with Publish before the tag step in the log;
  - poll the registry every 30 s for up to 15 min;
  - the tarball has 44 files;
  - `git ls-remote --tags origin v0.18.0`;
  - `npm view kairos-design@^0.17.0 version` prints 0.17.0.

  Then the install test from npm (`npm-package-release.md` section 5 step 6, with `radix-ui@1 @tanstack/react-table@9`).
- **Archive and follow-on.** Archive `kairos-design-brand-2026-epilogue` in the store (`openspec archive`, then `validate --all --strict`; fix any `TBD` Purpose) and log the PR, run ids and results. The website card pins 0.18.0. Each app's bump plan takes Epilogue (or Archivo, if group 6 was dropped) with shots before the reviewer's yes.
