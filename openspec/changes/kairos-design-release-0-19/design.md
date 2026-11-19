# Design: kairos-design-release-0-19

## Context

- **Base.** `kairos-design` `main` at `725c182` is 0.18.0 (npm `latest`, published 18 November 2026 02:44 UTC). Its `dist/` is byte-identical to npm's 0.18.0 tarball (the planner unpacked the tarball and ran `diff -rq` on 18 November 2026). Sha256 values:
    - `tokens.css` `5b62f0ced3f19ab7346b2987838d8f4ddd3106ab7f17ea29c88098e8c4b6e99e`
    - `base.css` `6f0ad07bc2fb1e3ecdcf877d35673fe3c0ae479be0e50544d708dd02961b79a5`
    - `kairos.css` `de60d565f5be8232ea932b06803be2574bd13ec546e13c469dd7eec1ecae9190`
    - `brand.css` `24bba37742a7df07cfd0c24c4ce414bbc10a905c1ac8eb528b2f46c0b334cfec`

    The package has no `src/`; `dist/` is the source.

- **The decision.** Paykit redesign round 1, decision 6, taken as recommended on 18 November 2026: "kairos-design: 16px body text on phones; the stamp shadow only on primary buttons." The review's finding: "Body text is 14 px and button labels 12 px (kairos-design tokens), small for one-handed use between jobs. Every panel wears the hard 6 px ink stamp, so cards look as pressable as buttons and compete with the main action." The reviewer then said "Yes publish" for this release.
- **The look.** Kairos design brief v3 (approved 17 November 2026): a cream page with white cards, the logo's yellow for main buttons, "square-edged buttons and fields with a firm dark edge". Its technical lock (revision 3) gives cards the soft card shadow and keeps the hard ink offset for a hovered button; the package's Brand Scale already carries both (`--kairos-shadow-soft-card`, `--kairos-shadow-press`, which `tokens.css` notes as the brief's). The round 1 prototype applies them to the app: `--stamp: 4px 4px 0` ink on `.btn.primary` only, `--shadow-soft` on `.card`, `.list` and the document paper, body `16px/1.5`, buttons 15px (small 14px).
- **0.18.0 today, Product Scale** (no `data-scale`):
    - `--kairos-text-body: 0.875rem` (14px) at every width; `--kairos-text-button: var(--kairos-text-sm)` (12px); `--kairos-text-button-sm: var(--kairos-text-xs)` (11px).
    - The stamp: `--kairos-shadow-pressed` 2px, `--kairos-shadow` 4px, `--kairos-shadow-card` 6px, `--kairos-shadow-lg` 8px, all `0` blur in `--kairos-shadow-color` (ink, linen on dark).
    - Who wears it: `kairos-panel`, `kairos-disclosure` and `kairos-disclosure-group` (6px); `kairos-card`, `kairos-overflow-menu`, `kairos-combobox-menu`, `kairos-toast` and `kairos-skip-link` (4px); `kairos-dialog-content` and `kairos-popover` (8px); the filled button ranks through `--kairos-button-shadow-rest/-hover/-active` (4/6/2px); `kairos-page-header-primary` reads `--kairos-shadow`, `-card` and `-pressed` directly.
- **Before** (planner's run at `725c182`, Node 26.12.1, no install):
    - `npm test` (`node --test tests/*.test.mjs`): 167 tests, 167 pass.
    - `npm pack --dry-run --json --ignore-scripts`: 44 files, 160,785 bytes packed, 546,482 unpacked.
    - `dist/kairos.css`: 209,661 bytes (53,032 gzip -9).
    - Story tests: not run by the planner (they need an install and Chromium). The 0.18.0 review run had 80 stories in 21 files, all passing; nothing in stories changed since.
- **A planner trial.** On a scratch copy the planner made the token and rule edits below and ran `npm test`. Only the 0.14 and 0.17.0 guards and the 0.14 token test failed, and with the lists in "Guards" they passed (167/167). The lists below are what that trial printed, not guesses.

## Consumers

Read from GitHub on 18 November 2026 with the read-only login (`gh api …/contents/<path>?ref=<branch>`, lockfile versions from each `package-lock.json` / `yarn.lock`). internal-tools `main` is `c41ac5a4`; its `qa` pins the same.

| Consumer | Where | Range | Locked | Gets 0.19.0 |
|---|---|---|---|---|
| Kairos website | `website` `main` | `^0.14.0` | 0.14.0 | Only by its own plan |
| Kairos website | `website` `qa` | `0.18.0` | 0.18.0 | Only by its own plan |
| Paykit | `internal-tools` `deploy/apps/paykit` | `^0.17.0` | 0.17.0 | Its redesign plan repins (below) |
| Mailkit | `internal-tools` `deploy/apps/mailkit` | `^0.17.0` | 0.17.0 | Only by its own plan |
| Account | `internal-tools` `deploy/apps/account` | `^0.17.0` | 0.17.0 | Only by its own plan |
| Card | `internal-tools` `deploy/apps/card` | `^0.14.0` | 0.14.0 | Only by its own plan |
| Uptime | `internal-tools` `apps/uptime` | `^0.14.0` | 0.14.0 | Only by its own plan |
| aikit | `internal-tools` `apps/aikit` | `^0.14.0` | 0.14.0 | Only by its own plan |

Under 0.x a caret range stops at the next minor, so **none of them changes until it repins**. Publishing 0.19.0 changes no deployed app or site.

- **Paykit redesign.** The plan `paykit-redesign-shell` (internal-tools) asks for exactly this release: body text 16px below 900px and 14px from 900px, and the soft card shadow on panels, cards, disclosures, dialogs, overflow menus, popovers and toasts with the stamp left on primary buttons. Until 0.19.0 exists it carries both in one Paykit-local override file marked for removal; its first task pins 0.19.0 and deletes that file if 0.19.0 is on npm when its card starts. This release uses its breakpoint and covers its list of surfaces (plus the select list and the skip link), so the repin needs no other change. It also gives Paykit 14px (13px small) button labels on phones, which the override did not have.
- **App-owned surfaces follow on a repin.** Two app stylesheets read the surface tokens: Paykit's `.paykit-quote-response-card` (`--kairos-shadow-card`) and Card's `.card-face` (`--kairos-shadow-lg`). On a repin both go soft with the package's own surfaces, which is the decision's intent. No app or site reads `--kairos-shadow` itself (planner grep of internal-tools `main` and of the website's `src/` on `qa`, which reads only the soft and press shadows).
- **Website.** It runs the Brand Scale, where `brand.css` already sets the body, button and surface shadow tokens and the button knobs (below), so a repin changes nothing it shows. `tests/fixtures/website-reads.txt` still guards every name it reads.

## Goals / Non-Goals

**Goals:** 16px body text and readable button labels on phones at the Product Scale, desktop unchanged; the ink stamp on rank-1 buttons only, the soft card shadow on every surface; the Brand Scale unchanged; a 0.18.0 guard proving nothing else moved; release 0.19.0.

**Non-Goals:**

- Field labels (13px), hints and error lines (12px), chips and table headers (11px), nav rows and meta text (13px) on phones. The decision names body text and the review names buttons; the rest is for the Paykit round 2 review to raise.
- Headings on phones. `--kairos-text-heading` is `--kairos-text-lg` (16px), so below 900px panel headings, section titles and titles reading it are the same size as body text there and differ only by weight (Risks).
- Control heights and the 44px touch target (`--kairos-control-h-touch`).
- `brand.css`, `base.css`, any React module, the dark redesign.
- Any app's or site's repin.

## Decided

1. **Version 0.19.0**, a minor release: two new tokens, three token values changed and new phone values. Under 0.x, `^0.18.0` excludes it. 0.19.0 is free on npm (`curl -s https://registry.npmjs.org/kairos-design`: versions end at 0.18.0, `/0.19.0` answers 404, 18 November 2026).
2. **"Phones" is a screen below 900px** (`@media screen and (max-width: 899px)`): the register's boundary where the sidebar goes and the bottom bar appears (`kairos-mobile-only`), and the breakpoint the Paykit redesign plan already uses. A tablet in portrait (768-899px) is on the bottom bar and gets the phone sizes too. 767px, the table-to-card swap, was the other candidate; it would leave the bottom-bar layout between 768 and 899px at 14px. The query names `screen` so paper keeps 14px: a printed A4 page is about 739px across, under the boundary (`kairos.css` › "Paper is not a phone"), and an app's printed report (its `kairos-table` reads the body step) would otherwise print at 16px in portrait and 14px in landscape.
3. **Body 16px as `1rem`.** `--kairos-text-body` stays in rem, as the type scale's comment says, so a reader's browser setting still moves it.
4. **Button labels 14px (`0.875rem`), small buttons 13px (`var(--kairos-text-md)`), on phones.** Why: a 700-weight label at 14px reads at least as large as 16px body at 400, it keeps the label one step under the body as the prototype does (15 under 16), and both are steps the scale already has, so no 15px step is added. The label takes the rem value the body leaves, so it follows a reader's setting too. 36px and 32px buttons hold a 14px and 13px label with room (the Brand Scale puts 16px in 50px). The prototype's 15px/14px were checked against this: one pixel smaller, no new step.
5. **One new rule in `tokens.css`**, after the existing 899px site-header block:

    ```css
    /* Phones: below the sidebar boundary, the 899/900 boundary of the register
       below, body text is 16px and button labels 14px (13px small). From 900px
       the sizes above stand. The Brand Scale sets all three at (0,2,0), which
       outranks this rule, so it is unchanged. `screen`: paper keeps 14px, since
       a printed A4 page is narrower than 900px. */
    @media screen and (max-width: 899px) {
      :root {
        --kairos-text-body: 1rem;
        --kairos-text-button: 0.875rem;
        --kairos-text-button-sm: var(--kairos-text-md);
      }
    }
    ```

    Every role built from these on `:root` resolves there, so `--kairos-type-body-size` and `--kairos-type-button-size` follow with no edit. `kairos.css` needs no font-size edit: its 11 rules that read `--kairos-text-body` (`kairos-body`, `kairos-body-muted`, `kairos-section-body`, `kairos-bullets`, `kairos-page-header-description`, `kairos-checkbox-row`, `kairos-choice-row`, `kairos-table`, `kairos-bulk-bar-count`, `kairos-inline-action`, `kairos-banner`), the three that read `--kairos-type-body-size` and `base.css`'s `body` follow, as do `.kairos-button`, `.kairos-button--sm` and `kairos-type-button`.

6. **Two stamp tokens for the buttons.** In the light `:root` block's stamp section, where the stamp lives today:

    ```css
    --kairos-shadow-pressed: 2px 2px 0 var(--kairos-shadow-color);
    --kairos-shadow-stamp: 4px 4px 0 var(--kairos-shadow-color);
    --kairos-shadow-stamp-hover: 6px 6px 0 var(--kairos-shadow-color);
    ```

    The names keep the `--kairos-shadow` prefix, so `tests/scale.test.mjs` › "every shadow comes from the stamp tokens" and the Colour page's swatch check (which skips `--kairos-shadow*`) need no edit. `--kairos-shadow-pressed` keeps its value and stays the press.

7. **The three surface tokens become the soft card shadow.** `--kairos-shadow`, `--kairos-shadow-card` and `--kairos-shadow-lg` leave the light block and are declared in the alias block (`:root, [data-theme]`), after `--kairos-shadow-press`, each as `var(--kairos-shadow-soft-card)`, so they follow a theme set below the root as the soft shadow does. Resolved: `0 14px 30px -20px rgba(71, 55, 40, 0.32)` light, `0 14px 30px -20px rgba(0, 0, 0, 0.5)` dark. This is what `brand.css` already sets them to at the Brand Scale. Re-pointing the tokens, rather than each rule, also takes app-owned surfaces that read them (Consumers).
8. **The button knobs read the stamp tokens:** `--kairos-button-shadow-rest: var(--kairos-shadow-stamp)`, `--kairos-button-shadow-hover: var(--kairos-shadow-stamp-hover)`, `--kairos-button-shadow-active: var(--kairos-shadow-pressed)`. They resolve to the same 4/6/2px stamps as in 0.18.0. `brand.css` sets all three at the Brand Scale, so the website's buttons are unchanged.
9. **Who keeps the stamp:** `kairos-button--primary`, `kairos-button--danger-solid` and `kairos-page-header-primary`, the three rules that read the button knobs. The destructive solid is the committing button of a confirmation dialog, rank 1 there, so it keeps rank 1's stamp. Secondary, tertiary, ghost and outline danger stay flat, as today.
10. **`.kairos-page-header-primary` reads the knobs** (`kairos.css:1908-1918`): `--button-shadow: var(--kairos-button-shadow-rest)`, `--button-shadow-hover: var(--kairos-button-shadow-hover)`, `--button-shadow-active: var(--kairos-button-shadow-active)`. At the Product Scale it resolves to the same stamp as 0.18.0. At the Brand Scale it now behaves as the brand's main button (no shadow at rest, the press offset on hover, none on press) instead of wearing the soft card shadow at rest. The page header is an app part; the website reads no `kairos-page-header` class.
11. **Who goes soft:** `kairos-panel`, `kairos-card`, `kairos-disclosure`, `kairos-disclosure-group`, `kairos-dialog-content`, `kairos-popover`, `kairos-overflow-menu`, `kairos-combobox-menu`, `kairos-toast` and `kairos-skip-link`. Their `box-shadow` lines don't change; the tokens they read do. The skip link is a link that appears on focus, not a button rank, so it goes with the surfaces. Floating layers (dialog, popover, menus) take the same soft card shadow, as at the Brand Scale; their 1px border still draws their edge.
12. **Nested panels stay flat.** The `box-shadow: none` rule after `.kairos-panel` (`kairos.css:1983-1993`) stays as it is: two soft shadows stacked would muddy as two stamps did.
13. **Comments.** `tokens.css`'s stamp comment says: the stamp is the rank-1 button's (rest, hover, press); since 0.19.0 surfaces take the brief's soft card shadow through the three old names. The `.kairos-panel` comment in `kairos.css` (the "Shadow Rank" paragraph, `kairos.css:1967-1971`) says the same, and the button-rank comment (`kairos.css:5896-5906`) keeps "fill, border, and stamp". Comments in `dist/react/` are not touched (no React module changes); two of them still say "stamp" about panels and are left for a later docs pass.
14. **`brand.css` is not touched.** It already sets `--kairos-text-body` (17px), `--kairos-text-button` and `--kairos-text-button-sm` (16px), the type ranks, the three surface tokens (soft) and the button knobs at `:root[data-scale='brand']`, specificity (0,2,0). The phone rule's `:root` is (0,1,0) and loses to it at every width, and the surface tokens already equal their Brand values.

## Product Scale after this change

| Token | Below 900px | From 900px | 0.18.0 |
|---|---|---|---|
| `--kairos-text-body` | `1rem` (16px) | `0.875rem` (14px) | `0.875rem` |
| `--kairos-text-button` | `0.875rem` (14px) | 12px | 12px |
| `--kairos-text-button-sm` | 13px | 11px | 11px |
| `--kairos-shadow-stamp` (new) | 4px 4px 0 ink | same | — |
| `--kairos-shadow-stamp-hover` (new) | 6px 6px 0 ink | same | — |
| `--kairos-shadow-pressed` | 2px 2px 0 ink | same | same |
| `--kairos-shadow`, `-card`, `-lg` | soft card | soft card | 4px, 6px, 8px ink |
| `--kairos-button-shadow-rest/-hover/-active` | 4px, 6px, 2px ink | same | same |

## Guards

### The 0.18.0 guard (new)

Copy `dist/tokens.css`, `dist/base.css`, `dist/kairos.css` and `dist/brand.css` from `725c182` into `tests/fixtures/kairos-design-0.18.0/` byte for byte (`git show 725c182:dist/<file>`). In `tests/product-scale.test.mjs`, add `FIXTURE_0_18`, an `OLD_0_18` reader as `OLD_0_17` is, and four tests that reuse the file's parsing, `keyed()` and Product Scale resolution, light and dark:

- "the 0.18.0 fixture is the published 0.18.0": the four sha256 values above.
- "every 0.18.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.19 lists": every 0.18.0 token by name, and every `base.css`/`kairos.css` key, exists with an equal resolved value, except the `CHANGED_0_19` entries, which must resolve to the value listed. Every entry must point at a 0.18.0 key, and every token entry must actually change.
- "a new 0.19 rule on a 0.18.0 class is Brand-scoped or listed": the shape of "a new 0.18 rule on a 0.17.0 class…", against `NEW_0_19`, which is empty. (The page header's primary changes values on existing keys, which this test does not police.)
- "tokens.css adds only the phone type rule to its width queries": every 0.18.0 `tokens.css` custom property inside a width `@media` (any context other than `@media not print`) is still declared in the same context and selector with the same value, and the only new ones are the three `PHONE_0_19` entries, under `@media screen and (max-width: 899px)` on `:root`.

`tokenMaps()` skips width queries, so without the fourth test the phone rule would pass every guard unseen.

### The lists (constants in `tests/product-scale.test.mjs`)

```js
const SOFT_0_19 = { light: '0 14px 30px -20px rgba(71, 55, 40, 0.32)', dark: '0 14px 30px -20px rgba(0, 0, 0, 0.5)' };
const CHANGED_0_19 = {
  // The three surface tokens take the brief's soft card shadow (decision 6).
  tokens: ['--kairos-shadow', '--kairos-shadow-card', '--kairos-shadow-lg'].map((token) => ({ token, value: SOFT_0_19 })),
  // The ten surfaces that read them, top-level kairos.css rules.
  declarations: [
    '.kairos-skip-link', '.kairos-disclosure', '.kairos-disclosure-group', '.kairos-panel', '.kairos-card',
    '.kairos-dialog-content', '.kairos-overflow-menu', '.kairos-combobox-menu', '.kairos-popover', '.kairos-toast',
  ].map((selector) => ({ selector, prop: 'box-shadow', value: SOFT_0_19 })),
};
const PHONE_0_19 = [
  { context: '@media screen and (max-width: 899px)', selector: ':root', prop: '--kairos-text-body', value: '1rem' },
  { context: '@media screen and (max-width: 899px)', selector: ':root', prop: '--kairos-text-button', value: '0.875rem' },
  { context: '@media screen and (max-width: 899px)', selector: ':root', prop: '--kairos-text-button-sm', value: 'var(--kairos-text-md)' },
];
const NEW_0_19 = [];
```

`CHANGED_0_19` entries are **not** applied to the old version's token map. A listed token or declaration is compared with its listed value; everything else, the buttons and the page header's primary included, must resolve as before. (Applying them to the old map would make every button reader resolve soft on the old side and fail.)

### The 0.14 and 0.17.0 guards learn the same list

- "every 0.14 declaration resolves the same at Product Scale, light and dark": a token in `CHANGED_0_19.tokens` is compared with its listed value per theme; a top-level `kairos.css` declaration in `CHANGED_0_19.declarations` likewise. Nothing else changes in that test.
- "every 0.17.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.18 lists": the same two lookups, after the `GONE_0_18`/`CHANGED_0_18` handling. Its name stays.
- `tests/brand-tokens.test.mjs` › "every 0.14 token name still resolves, to its 0.14 value unless listed": `LISTED.light` gains `--kairos-shadow` `['4px 4px 0 #16110b', '0 14px 30px -20px rgba(71, 55, 40, 0.32)']`, `--kairos-shadow-card` `['6px 6px 0 #16110b', …]`, `--kairos-shadow-lg` `['8px 8px 0 #16110b', …]`; `LISTED.dark` the same with `#f5f1e8` and `rgba(0, 0, 0, 0.5)`.

The planner's trial passed with exactly these edits.

## Tests that change

- `tests/product-scale.test.mjs`: the fixture path, the lists and the four 0.18.0 tests above; the two `CHANGED_0_19` lookups in the 0.14 and 0.17.0 guards. The header comment says the file guards 0.14, 0.17.0 and 0.18.0.
- `tests/brand-tokens.test.mjs`: the `LISTED` entries above. No other edit.
- New `tests/product-type-and-stamp.test.mjs` (top-level `test()`, no `describe`), reading `dist/` with `tests/helpers/css.mjs`:
    - "below 900px body text is 16px and button labels 14px and 13px": the `@media screen and (max-width: 899px)` `:root` rule in `tokens.css` (the query names `screen`, so paper keeps 14px) sets the three values of decision 5, and resolved through the light map (with that rule applied over `:root`) they are `1rem`, `0.875rem` and `13px`.
    - "from 900px body text and button labels keep their 0.18.0 sizes": the top-level `:root` values resolve to `0.875rem`, `12px` and `11px`, and no `min-width` query in `tokens.css` sets any of the three.
    - "the Brand Scale keeps its body and button sizes on phones": `brand.css`'s one rule is `:root[data-scale='brand']` and sets `--kairos-text-body` 17px and `--kairos-text-button` and `--kairos-text-button-sm` 16px, and the phone rule's selector is exactly `:root`, so the brand rule wins at every width.
    - "only rank-1 buttons wear the ink stamp at the Product Scale": every `kairos.css` declaration of `box-shadow`, `--button-shadow*` or a `--kairos-*shadow*` knob, resolved in light and dark, that is an ink offset (`/\b\d+px \d+px 0 (0 )?#(16110b|f5f1e8)\b/`) is on `.kairos-button--primary`, `.kairos-button--danger-solid` or `.kairos-page-header-primary`, and each of those three has `--button-shadow` at 4px, `--button-shadow-hover` at 6px and `--button-shadow-active` at 2px. The planner's trial found exactly those nine declarations per theme.
    - "surfaces wear the soft card shadow at the Product Scale": the ten `CHANGED_0_19` selectors resolve to the soft card shadow in light and dark, and the nested-panel rule still sets `box-shadow: none` on its nine selectors.
    - "the page header's primary reads the button stamp knobs": `.kairos-page-header-primary` sets `--button-shadow`, `--button-shadow-hover` and `--button-shadow-active` to `var(--kairos-button-shadow-rest)`, `-hover` and `-active`.
- `tests/release.test.mjs`: add "the docs describe 0.19.0" (Docs). The pack test stays and must still pass with 44 files.
- Every other test file is unchanged and must pass: `scale`, `emit`, `contrast`, `contract`, `brand-scale`, `brand-parts`, `geometry`, `format`, `sort`, `theme`, `confirm`.

## Workshop

The story tests run in Vitest's browser iframe at the Storybook Vitest addon's default 1200×900, unless a story names a viewport (`@storybook/addon-vitest` 10.6.7 › `DEFAULT_VIEWPORT_DIMENSIONS`, `setViewport`). Only "Phone Sizes" names one: the workshop's `narrow` viewport (419px, `.storybook/preview.tsx`) through `globals: { viewport: { value: 'narrow' } }`, so its play runs the phone branch. No other assertion may depend on the width. The planner's browser checks cover 390, 820 and 1366.

- `stories/foundations/Type.stories.tsx`:
    - "The steps" note under Scale says the body step is 16px and the button roles 14px and 13px below 900px.
    - New export `PhoneSizes` (story name "Phone Sizes") with `globals: { viewport: { value: 'narrow' } }`: a `p.kairos-body`, a `Button variant="primary"` and a small `Button`. Play: `matchMedia('screen and (max-width: 899px)').matches` is `true` (so a story left at the default width fails here, not on a size), the paragraph's `fontSize` is `16px`, the button's `14px` and the small button's `13px`; `<html>` has no `data-scale`. 0.18.0 fails this story (14/12/11px).
- `stories/foundations/Geometry.stories.tsx`:
    - "The stamp" section shows `shadow-stamp`, `shadow-stamp-hover` and `shadow-pressed` with their uses (a rank-1 button at rest, under the cursor, held), and its note says only rank-1 buttons wear it.
    - A new "Surfaces" section shows `shadow`, `shadow-card` and `shadow-lg` (the soft card shadow since 0.19.0: cards, panels, menus, dialogs, toasts).
    - The Shape lede and the Nesting lede and heading drop "stamps"/"stamped" for panels ("the outermost panel is raised and everything nested in it is flat").
    - New export `Elevation` (story name "Elevation"): a `div.kairos-panel` holding a nested `div.kairos-panel`, and beside the outer panel (not inside it, where the nested-panel rule flattens a card) a `div.kairos-card`, a primary and a secondary `Button`. Play: the outer panel's and the card's `boxShadow` equal `shadow('--kairos-shadow-soft-card')`; the nested panel's is `none`; the primary's is `` `${rgb('#16110b')} 4px 4px 0px 0px` ``; the secondary has no shadow (`noShadow`). It imports `shadow`, `rgb`, `noShadow` and `style` from `../brand/computed`.
- `stories/brand/Actions.stories.tsx` › "Without The Switch" already asserts the Product primary's 4px stamp and still passes; no edit.
- Two new exports: 82 stories in 21 files after, 80 before. No assertion on a hover or text width; only "Phone Sizes" names a viewport.

## Docs

- `docs/adoption.md`, "Upgrading to 0.19.0" above "Upgrading to 0.18.0". It says:
    - minor; apps and sites on `^0.18.0` or earlier don't get it until they repin;
    - below 900px `--kairos-text-body` is `1rem` (16px), `--kairos-text-button` 14px and `--kairos-text-button-sm` 13px, from 900px nothing moves, and the Brand Scale is unchanged;
    - only rank-1 buttons wear the stamp, through `--kairos-shadow-stamp`, `--kairos-shadow-stamp-hover` and `--kairos-shadow-pressed`; `--kairos-shadow`, `--kairos-shadow-card` and `--kairos-shadow-lg` are the soft card shadow, so an app's own card that reads them goes soft too, and an app's own button that wants the stamp reads `--kairos-shadow-stamp`;
    - an app that carried a local override for either (16px phone body, soft panels) deletes it on the repin;
    - check an app's own dense tables between 768 and 899px, where they are still tables at 16px.
- `docs/decisions.md`, a new section "Phone text and the main action's stamp, 0.19.0" at the end: the reviewer's decision and the review's finding in one paragraph; the 899px boundary (decision 2); 16px body and 14/13px labels with the reason (decision 4); the stamp kept for rank 1 and why the surface tokens were re-pointed rather than each rule (decisions 7-11); `brand.css` untouched. Earlier sections are history and stay.
- `docs/kairos-ui.md`:
    - The type table (lines 82-91): the `--kairos-text-body` row says "Body, table cells; `1rem` (16px) below 900px"; the `--kairos-text-sm` row's "Buttons" moves to a sentence under the table: below 900px `--kairos-text-button` is 14px and `--kairos-text-button-sm` 13px.
    - "Line, radius, and the stamp" (lines 139-175): the stamp table lists `--kairos-shadow-pressed` 2px (a rank-1 button held), `--kairos-shadow-stamp` 4px (at rest), `--kairos-shadow-stamp-hover` 6px (under the cursor); a second table or sentence says `--kairos-shadow`, `--kairos-shadow-card` and `--kairos-shadow-lg` are the soft card shadow on cards, panels, menus, dialogs and toasts. The nesting paragraph keeps its rule and its `kairos-panel--flat` advice with "raised" for "stamps". "Only the filled button ranks carry a stamp" becomes "Only rank-1 buttons carry the stamp: primary, the confirmation's destructive solid, and the page header's primary."
    - The `kairos-panel` row (line 230): "ground, border, radius, and the soft card shadow"; line 253 likewise; the `kairos-disclosure-group` row (line 228): "one raised panel" for "one stamp"; the `kairos-card--soft` row (line 459): "A tool's bordered card (`kairos-card`)" for "A tool's raised card, which keeps the stamp".
- `README.md`: unchanged (its Fonts and Brand rows are still true).
- `docs/preview.html`: its one "stamp" line is about `kairos-table-panel` on its own and stays.
- Public repository: no client names, job numbers or internal paths in any file. Say "an app" or "the apps", never an app's client.

## Research

- **Where the change lives.** Options: (a) each app overrides the two values locally; (b) the package re-points its rules one by one to the soft shadow; (c) the package re-points the three surface tokens and moves the stamp to button-only tokens. (a) is what the Paykit plan does until 0.19.0 exists, and it drifts per app. (b) leaves app-owned surfaces that read `--kairos-shadow-card`/`-lg` stamped (two found). (c) matches what `brand.css` does at the Brand Scale and reaches app-owned surfaces, so it was picked.
- **Breakpoint.** The register's seven boundaries (`tokens.css` › Breakpoints): 899/900 is the bottom-bar/sidebar switch, 767/768 the table-to-card swap. The Paykit plan uses 900. Picked 899px.
- **Button label size.** The prototype draws 15px (14px small); the type scale has 13, 14 and 16 near it. Picked 14/13px (decision 4). External guidance (platform type ramps) was not checked for this plan.
- **Specificity.** `brand.css`'s (0,2,0) selector beats `:root` (0,1,0) inside a media query, so the phone rule can't reach the Brand Scale: read from the files, and the new test pins it. Not yet seen in a browser; the planner's workshop compare checks it.

## Risks / Trade-offs

- [Dense app tables between 768 and 899px grow from 14px to 16px and may scroll sideways sooner] → The adoption note names it; the planner's compare takes a 820px width; each app's repin plan takes shots.
- [Headings equal body text on phones: below 900px `--kairos-text-heading` (16px) and the body step are both 16px, so panel headings, section titles, record-row, disclosure and dialog titles and `dd` values differ from body only by weight] → Accepted for now (planner's pick): no heading step is added. The compare's contact sheet shows a headed panel at 390 so the reviewer sees it, and the reviewer looks again on Paykit's QA after its repin; a phone heading size would be a later release.
- [Dark surfaces lose the linen stamp and take the interim soft shadow colour, `rgba(0, 0, 0, 0.5)`, which shows little on a dark page] → Panels and cards keep their 1px border. The dark redesign replaces the colour. The compare looks at dark.
- [Floating layers (menus, popovers, dialogs) get a subtler shadow than their 4-8px stamp] → Their border and the dialog overlay still separate them, as at the Brand Scale. If the reviewer finds a menu hard to see in the compare, `--kairos-shadow-lg` can take the photo shadow in a 0.19.1 (one token).
- [An app's own button that read `--kairos-shadow` for a stamp would go soft] → None found in internal-tools or the website; the adoption guide names `--kairos-shadow-stamp`.
- [0.19.0 is taken by another release while this one is built] → The planner re-reads the registry and `main` before the pull request and takes the next minor if needed (release practice).

## Migration Plan

1. Build (one card), then the planner's review rerun and the before/after workshop compare.
2. Move the plan to the store, open the pull request, merge (= publish 0.19.0, under "Yes publish"), check the registry, and run an install test from npm.
3. Tell the Paykit redesign session that 0.19.0 is on npm: its card pins it and deletes the override file (its task 1.1). Other apps repin in their own plans.
4. Rollback: nothing installs 0.19.0 by range. An app that repinned goes back to its old pin; a fault gets a 0.19.1.
