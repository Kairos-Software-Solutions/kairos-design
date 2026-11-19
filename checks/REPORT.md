# Report: kairos-design 0.19.0 build

Branch `release/0.19`, built on `725c182` (0.18.0). Nothing pushed. The change is not archived. Node v24.22.3, npm 11.19.1.

## Tasks

| Task | Check | Result |
|---|---|---|
| 1.1 Baseline | `npm ci`, Chromium, `npm test`, stories JSON, `npm pack --dry-run` | All five completed. 167/167 tests; 80 stories in 21 files, all passing; 44 files, 160785 bytes. See `ci-commands.md` (Before). `--with-deps` needs root and failed; plain `playwright install chromium` worked. |
| 1.2 0.18.0 guard | The four tests exist; with `CHANGED_0_19` and `PHONE_0_19` emptied (copy of the file, since deleted) all 11 tests passed on the untouched code; changing one surface's box-shadow value by hand in `dist/kairos.css` failed the 0.18.0 test (and the 0.17.0 one); adding the one-token `@media screen and (max-width: 899px) { :root { --kairos-text-body: 1rem; } }` to `dist/tokens.css` failed "tokens.css adds only the phone type rule…"; both reverted. | Done. With the lists in place the 0.18.0 test and the width test failed until groups 2 and 3, as expected. |
| 2.1 Phone type | `node --test` on `product-type-and-stamp`, `product-scale`, `scale`, `brand-scale`, `contract` | 64 of 65 passed; the one failure was "every 0.18.0 declaration resolves the same…", which waits for group 3, as the task says. |
| 3.1 Stamp only on rank 1 | `npm test` in full | 177/177 (178 after the docs test). `scale.test.mjs` › "every token is read by something" and "every shadow comes from the stamp tokens" pass, with `scale`, `contrast` and `contract` tests unedited. Bite check: pointing the first `box-shadow: var(--kairos-shadow)` surface at the pressed stamp failed "only rank-1 buttons wear the ink stamp…" and "surfaces wear the soft card shadow…". |
| 4.1 Workshop | `npx vitest run --project stories stories/foundations stories/brand`; `npm run typecheck`; `build-storybook` | 9 files, 20 stories passed (axe on), none skipped; Brand/Actions › "Without The Switch" unedited and passing; typecheck exit 0; workshop build exit 0. Bite checks: "Phone Sizes" at the `wide` viewport fails on `matchMedia` ("expected false to be true"); with the phone rule's body value reverted it fails on "expected '14px' to be '16px'"; "Elevation" with `--kairos-shadow-card` set to the stamp fails on the outer panel's box-shadow. All reverted. |
| 5.1 Release and docs | `npm test` | 178/178. `package.json` and the lockfile's two top `version` fields are 0.19.0. |
| 6.1 Fresh install and CI commands | See `ci-commands.md` (After) | Every command exit 0; 178 tests (>167), 0 failed; stories 82 total (80 + 2), 0 failed, 0 pending; 44 packed files. |
| 6.2 Diff audit and validation | Below | All as the task says. |

## 6.2 outputs

```
$ git diff --stat 725c182 (without checks/)
 26 files changed, 8672 insertions(+), 68 deletions(-)
   (the 0.18.0 fixture, 7,305 lines, and the plan files are most of it; dist/: kairos.css 29 lines, tokens.css 43)

$ git diff --exit-code 725c182 -- dist/brand.css dist/base.css dist/format dist/react bin .github
exit 0

$ git diff 725c182 -- tests/scale.test.mjs tests/emit.test.mjs tests/contrast.test.mjs tests/contract.test.mjs tests/brand-scale.test.mjs tests/brand-parts.test.mjs
(empty: 0 bytes)

$ node (version of package.json)             0.19.0
$ node (versions in package-lock.json)       0.19.0 0.19.0
manifest: same (ignored version)
```

`git diff 725c182 -- dist/kairos.css` is saved as `checks/kairos-css.diff`. Its only changed declaration lines are the three on `.kairos-page-header-primary` (`--button-shadow`, `--button-shadow-hover`, `--button-shadow-active` now `var(--kairos-button-shadow-rest)`, `-hover`, `-active`); every other changed line is a comment (the page header primary's, the `.kairos-panel` "Shadow Rank" paragraph, and the nested-panel paragraph).

Plan validation (`checks/openspec-validate.log`): in a store-less copy (`git archive HEAD openspec`, `store:` line deleted, `git init`), `OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.16.0 validate kairos-design-release-0-19 --strict` prints "Change 'kairos-design-release-0-19' is valid", exit 0, plus the two expected "Archive would refuse this delta" INFO lines. In place (real config, untouched) it also prints valid, exit 0, with the "declaration is ignored" warning.

## CHECK lines

Scenarios against CHECK lines: brand-scale 1/1, brand-tokens 14/14, product-scale 10/10, release-0-18 0/0 (removal only), release-0-19 6/6. All Node tests are in `npm test` (`checks/npm-test-after.log`: 178 pass); all stories in `checks/stories-after.json` (82 pass).

### kairos-design-brand-scale

| CHECK | Proof | Result |
|---|---|---|
| Soft shadows replace the stamp | `stories/brand/Surfaces.stories.tsx` › "Cards And Bands" (unedited) | pass |

### kairos-design-brand-tokens

| CHECK | Proof | Result |
|---|---|---|
| Old name, same value | `tests/brand-tokens.test.mjs` › "every 0.14 token name still resolves, to its 0.14 value unless listed" | pass |
| A renamed role keeps its old name | `tests/brand-tokens.test.mjs` › "a renamed role keeps its old name as an alias" | pass |
| A theme set below the root | `tests/brand-tokens.test.mjs` › "old names re-resolve wherever a theme is set" | pass |
| The fixture is the published release (0.14) | `tests/product-scale.test.mjs` › "the 0.14.0 fixture is the published 0.14.0" | pass |
| Every 0.14 declaration resolves the same | `tests/product-scale.test.mjs` › "every 0.14 declaration resolves the same at Product Scale, light and dark" | pass |
| New rules on existing classes | `tests/product-scale.test.mjs` › "a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale" | pass |
| base.css untouched | `git diff --exit-code 725c182 -- dist/base.css` | exit 0 (see 6.2 outputs) |
| The 0.17.0 fixture is the published release | `tests/product-scale.test.mjs` › "the 0.17.0 fixture is the published 0.17.0" | pass |
| Every 0.17.0 declaration resolves the same | `tests/product-scale.test.mjs` › "every 0.17.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.18 lists" | pass |
| New 0.18 rules on 0.17 classes | `tests/product-scale.test.mjs` › "a new 0.18 rule on a 0.17.0 class is Brand-scoped or listed" | pass |
| The 0.18.0 fixture is the published release | `tests/product-scale.test.mjs` › "the 0.18.0 fixture is the published 0.18.0" | pass |
| Every 0.18.0 declaration resolves the same | `tests/product-scale.test.mjs` › "every 0.18.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.19 lists" | pass |
| New 0.19 rules on 0.18 classes | `tests/product-scale.test.mjs` › "a new 0.19 rule on a 0.18.0 class is Brand-scoped or listed" | pass |
| Width-scoped token rules | `tests/product-scale.test.mjs` › "tokens.css adds only the phone type rule to its width queries" | pass |

### kairos-design-product-scale

| CHECK | Proof | Result |
|---|---|---|
| Phone sizes | `tests/product-type-and-stamp.test.mjs` › "below 900px body text is 16px and button labels 14px and 13px" | pass |
| Desktop sizes kept | `tests/product-type-and-stamp.test.mjs` › "from 900px body text and button labels keep their 0.18.0 sizes" | pass |
| Phone sizes in the workshop | `stories/foundations/Type.stories.tsx` › "Phone Sizes" | pass |
| Brand outranks the phone rule | `tests/product-type-and-stamp.test.mjs` › "the Brand Scale keeps its body and button sizes on phones" | pass |
| brand.css untouched | `git diff --exit-code 725c182 -- dist/brand.css` | exit 0 |
| Ink offsets only on rank 1 | `tests/product-type-and-stamp.test.mjs` › "only rank-1 buttons wear the ink stamp at the Product Scale" (exactly nine ink-offset declarations per theme) | pass |
| The page header's primary reads the knobs | `tests/product-type-and-stamp.test.mjs` › "the page header's primary reads the button stamp knobs" | pass |
| Soft surfaces | `tests/product-type-and-stamp.test.mjs` › "surfaces wear the soft card shadow at the Product Scale" | pass |
| Elevation in the workshop | `stories/foundations/Geometry.stories.tsx` › "Elevation" | pass |
| Before and after in the workshop | planner | not mine |

### kairos-design-release-0-19

| CHECK | Proof | Result |
|---|---|---|
| Version and exports | `tests/release.test.mjs` › "brand.css is exported and every 0.14 export is unchanged"; version commands (6.2 outputs) | pass; `0.19.0` and `0.19.0 0.19.0` |
| Manifest otherwise unchanged | 6.2 compare | `manifest: same (ignored version)` |
| Pack list | `tests/release.test.mjs` › "the packed files are 0.14's plus AccountMenu (0.15.0) and brand.css"; `checks/pack-after.json` | pass; 44 entries, 161558 bytes (160785 before) |
| Names still declared | `tests/release.test.mjs` › "every name the website reads is still declared" | pass |
| Docs present | `tests/release.test.mjs` › "the docs describe 0.19.0" | pass |
| Published, then tagged | planner, after the merge | not mine |

## Files changed, and why

- `dist/tokens.css`: the phone rule; `--kairos-shadow-stamp` and `-hover`; the three surface tokens declared in the alias block as `var(--kairos-shadow-soft-card)`; the button knobs read the stamp tokens; stamp comments.
- `dist/kairos.css`: the page header primary's three custom properties; comments on it, on `.kairos-panel` (Shadow Rank) and on the nested-panel rule.
- `docs/kairos-ui.md`: type table and sentence, stamp section, surfaces, the `kairos-panel`, `kairos-disclosure-group`, `kairos-card--soft` rows and the panel paragraph.
- `docs/adoption.md`, `docs/decisions.md`: the 0.19.0 sections.
- `package.json`, `package-lock.json`: `version` only (lockfile's two top fields).
- `tests/fixtures/kairos-design-0.18.0/`: the four published 0.18.0 stylesheets, byte for byte, sha256 matching `design.md`.
- `tests/product-scale.test.mjs`: fixture, lists, four 0.18.0 tests, the two `CHANGED_0_19` lookups in the 0.14 and 0.17.0 tests, header comment.
- `tests/brand-tokens.test.mjs`: six `LISTED` entries.
- `tests/product-type-and-stamp.test.mjs` (new): six tests. `tests/release.test.mjs`: "the docs describe 0.19.0".
- `stories/foundations/Type.stories.tsx`: Scale note, "Phone Sizes". `stories/foundations/Geometry.stories.tsx`: stamp and surfaces sections, the ledes and nesting text, "Elevation".
- `openspec/changes/kairos-design-release-0-19/tasks.md`: ticks only.
- `checks/`: this evidence.

## Decisions not named in `design.md`

- The comment of the nested-panel rule in `kairos.css` ("two stamps stacked… the outermost panel on a region stamps") is reworded to "raised" and "soft shadows" too. It is a comment only; the rule is untouched. `design.md` names the `.kairos-panel` comment; leaving the next paragraph saying panels stamp would have contradicted it.
- The page header primary's own comment gained one sentence saying it reads the button knobs.
- The "Phone Sizes" story's secondary button uses `variant="secondary" size="sm"`; any small button reads the same token.
- "Elevation" and "Phone Sizes" use `data-elevation` attributes and class selectors; no `Page` wrapper.
- In the width-scoped guard, "width query" means any context other than `@media not print`, as `design.md` says; the check on `min-width` queries is a separate one in `product-type-and-stamp`.
- The adoption and decisions text says "an app" and "the apps" and names no client, job or internal path.

## Not run or different in the sandbox

- `npx playwright install --with-deps chromium` fails without root; the plain install was used and the stories ran fine.
- `rm -rf node_modules storybook-static` is refused by the sandbox: `npm ci` removes `node_modules` itself, `storybook-static` was overwritten by the build.
- The planner's before/after compare, the 390/820/1366 browser checks, the registry and publish checks: not mine, not run.
- No screenshots or browser checks beyond `test-stories`.
