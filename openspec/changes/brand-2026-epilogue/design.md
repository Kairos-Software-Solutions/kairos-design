# Design: brand-2026-epilogue

## Context

- **Base.** `kairos-design` `main` at `d36d95c` is 0.17.0. Its `dist/` is byte-identical to npm's 0.17.0 tarball (the planner checked this on 17 Nov 2026). Sha256 values: `tokens.css` `648bc07eb14caa3621600b23cc14855387aa4f1dcacb621ebc38bd74691bd5d8`, `base.css` `6f0ad07bc2fb1e3ecdcf877d35673fe3c0ae479be0e50544d708dd02961b79a5`, `kairos.css` `c0e6be31d027d1aac119d9a0c1f987937599424510bc59302f488e5e7ff28752`, `brand.css` `6354771efc709df7e7959f59b82256714f5a77447ec4be8428f914a40fc8250f`. The package has no `src/`; `dist/` is the source.
- **0.17.0** was released by the reviewer without a plan. It moved the apps' Product Scale onto the brief's type in one block at the end of `kairos.css`, whose every rule begins `:root:not([data-scale='brand'])`:
  - headings Archivo 800 at `font-stretch: 112%`, section headings 700 at 106%, the product name 800 at 100%;
  - typed labels in Courier Prime;
  - buttons, tabs and field labels in sentence case.

  It also made layout fixes and listed its changes in `tests/product-scale.test.mjs` (`CHANGED_0_17`, `NEW_0_17`). It did not update the store specs, and it did not update the "Without The Switch" story, which still expects an uppercase button. This change brings both in line.
- **The brief.** Kairos design brief v3 (owner brief, 17 November 2026) is applied as technical lock revision 3:
  - Epilogue replaces Archivo everywhere. It is a variable font, weight 100-900, upright and italic, normal width only. Headings are 800, body 400 at 17px.
  - Courier Prime keeps labels, prices, times and dates.
  - "Never set `font-stretch`": every width token and declaration is gone.
  - The heading roles are re-sized to the new pairing. Lead, statement, body, small, legal, button, nav, field text and every Courier role keep their sizes.

  The builder has the approved lock in `input/brief/` (`design-brief.md` › "Lock revision 3" and "Type scale", `theme.css`, `shots/rev3-*`, `reference/`).
- **Consumers.**
  - The Kairos website pins 0.16.0 today. Its next card pins 0.18.0, reads the package's names, and re-points the font tokens on `:root` with its `next/font` variable first.
  - Paykit, Card, Mailkit, Uptime and aikit pin `^0.14`. They get nothing from this release until their own bump plans.
  - The website reads none of the width tokens this change removes: `tests/fixtures/website-reads.txt` lists every name it reads, taken from its `src/`.
- **Before** (planner's run at `d36d95c`, Node 26):
  - `npm test`: 147 tests, 147 pass.
  - `npm pack --dry-run`: 44 files, 159,992 bytes packed, 543,971 unpacked.
  - `dist/kairos.css`: 208,336 bytes (52,657 gzip -9).
  - Story tests: not run by the planner (that needs an install and Chromium). The last builder run had 80 in 21 files, and 0.17.0 changed no story.

## Goals / Non-Goals

**Goals:** the Brand Scale on Epilogue at normal width with lock revision 3's sizes; P1-P6 and P8-P10 against 0.17.0; the apps' move to Epilogue as a task group that can be dropped whole; guards proving what apps see against 0.17.0 and that the website's names survive; release 0.18.0.

**Non-Goals:**
- P7, the day-grid date (Decided 9).
- The brief's revision 2 parts the package lacks: dropdown, phone-menu group, accordion, alert, time grid, skeleton, contents list, article card, reading column, back link, done panel.
- The review-line rank (Courier 15/400; the line's wording is site-only).
- The service-page and article title sizes (single site uses).
- Any app's bump, any React API change, the dark theme.

## Decided

1. **Version 0.18.0**, a minor release: new classes and tokens, and 16 width tokens removed. Under 0.x, `^0.17.0` excludes it.
2. **Brand Scale fonts live in `brand.css`** while the apps question is open. The rule gains `--kairos-display` and `--kairos-body` set to `'Epilogue', ui-sans-serif, system-ui, sans-serif`. `--kairos-mono` is untouched (Courier Prime at both scales). `tokens.css` keeps naming Archivo for the Product Scale until group 6. Group 6 moves Epilogue into `tokens.css` and deletes the two `brand.css` lines, so the family lives in one place (Apps follow Epilogue).
3. **No width in the brand layer** (lock revision 3). Delete every `--kairos-*-stretch` token from `tokens.css` (16) and `brand.css` (16), and every `font-stretch` declaration that reads one from `kairos.css` (20, listed under Apps against 0.17.0 › `GONE_0_18`). The two Brand-scoped rules that held only a width (`:root[data-scale='brand'] .kairos-button`, `:root[data-scale='brand'] .kairos-input-label`) go whole. Removing a token from the public set is acceptable in a 0.x minor: only the website consumes 0.16+ tokens, and it reads none of these. The adoption guide lists them.
4. **Type follows lock revision 3 where the package owns the role** (Brand Scale table below). The display rank's phone size equals its desktop clamp (`clamp(31px, 3.8vw, 50px)`): the brief drops the under-520px rule, and the token stays so nothing that reads it breaks. Phone menu rows go from 26px to 23px (`--kairos-site-menu-row-size`, a part token that holds the brief's value at both scales, as in 0.16.0).
5. **P3, compact title.** `kairos-type-title--compact` reads `--kairos-type-title-compact-size`. That is `clamp(35px, 3.8vw, 52px)` at Brand Scale (the brief's "Form page title": Contact, Reschedule, Cancel), and `var(--kairos-text-title)` (24px) by default. Its weight, line height and tracking are the title's (identical in the brief). The patch list's `clamp(42px, 4.6vw, 62px)` is the Archivo-era value and is not used.
6. **P4, card heading.** `kairos-type-card` is 20px/800, line height 1.15, tracking 0 at Brand Scale (the brief's service card name, `--kd-text-card-title`). `kairos-type-card--sm` is 19px (who cards, the "This article is about" link). Defaults: `var(--kairos-text-lg)`, 700, 1.2, 0, as the h3 rank; `--kairos-type-card-sm-size` also defaults to `var(--kairos-text-lg)` (16px). The patch list's open point (23px vs 22px at 115%) is settled by the brief's rev 3 values, so it needs no call. The article row's `clamp(18px, 1.5vw, 20px)` and the form section's 18px stay site sizes.
7. **P5, time.** `kairos-type-time` is Courier Prime 16px/400, line height 1.6, tracking 0 at Brand Scale (rev 3 "time line 16px/400"). Defaults: `var(--kairos-text-md)`, 400, 1.5, 0, as the small rank. No width token.
8. **P6, tick values.** Three knobs: `--kairos-tick-list-value-size`, `--kairos-tick-list-value-phone-size` and `--kairos-tick-list-value-leading`. They default to the statement rank's size, size and leading. At Brand Scale they are `clamp(19px, 1.6vw, 21px)`, 18px and 1.35. Rev 3 keeps the statement sizes, so the patch list's numbers stand. The statement variant keeps the statement rank.
9. **P7 dropped.** Lock revision 2 (B11) puts the day-grid date on two lines under 560px on purpose (day number over month, at least 12px either side from 360px). P7's `-0.03em` tracking would keep it on one line, which undoes that. The two-line date becomes a package change when that work is planned.
10. **P1.** `.kairos-type-label, .kairos-type-price` (`kairos.css:5231-5234`) add `text-transform: none`. `.kairos-site-footer-heading` (`kairos.css:5101-5107`) adds `line-height: var(--kairos-type-label-leading)`, `letter-spacing: var(--kairos-type-label-tracking)` and `text-transform: none`, without the patch list's `font-stretch`. The base `h1`-`h6` rule (`kairos.css:94-104`) stays: apps on 0.14 rely on it. At the Product Scale, 0.17.0's type block already sets headings in sentence case, so P1 only matters at the Brand Scale.
11. **P2.**
    - `.kairos-title-bar::after` (`kairos.css:5195-5203`) adds `rotate: var(--kairos-marker-tilt)`.
    - `.kairos-marker::after` (`kairos.css:5182-5193`) replaces `transform: rotate(var(--kairos-marker-tilt))` with `rotate: var(--kairos-marker-tilt)` and keeps its `transform-origin`.
    - Reason: the website wipes both in with `transform: scaleX()`, which would replace a `transform: rotate()`. The reference draws both with `rotate: -1deg`.
12. **P8.**
    - The documented text link wraps its label and arrow in one span: `<a class="kairos-text-link"><span class="kairos-text-link-text">Words <span class="kairos-text-link-arrow">→</span></span></a>`.
    - `kairos.css` adds `.kairos-text-link-text { display: inline; }` after `kairos.css:4383-4386`.
    - The arrow rules stay. The `docs/kairos-ui.md` row (line 451) says so.
    - Reason: with the arrow as a direct child of the `inline-flex` anchor it becomes a flex item and gets its own underline. The reference wraps both (checked in a browser by the QA sort).
13. **P9.**
    - After `.kairos-site-menu-row` (`kairos.css:5036-5046`), add `.kairos-site-menu-row[aria-current='page'] { text-decoration-line: underline; text-underline-offset: var(--kairos-menu-link-current-offset); }`, with no colour, so it is the row's ink.
    - This matches the reference (`.sheet-nav a[aria-current]`: underline, offset 6px, ink).
14. **P10.**
    - After `kairos.css:2181-2183`, add `.kairos-button:not([aria-busy='true']) .kairos-button-pending .kairos-spin { animation: none; }`.
    - `.kairos-spin` (`kairos.css:178-180`) and `Button.tsx` stay as they are.
    - Nothing visible changes: the ring is `visibility: hidden` while idle, but a hidden element still animates.
15. **New classes get their own rule blocks.** They do not join an existing selector list, so every 0.17.0 rule keeps its key and the guards stay readable:
    - `.kairos-type-title--compact` comes after `.kairos-type-title`.
    - `.kairos-type-card` sets `margin: 0`, the display family, `text-transform: none`, `text-wrap: balance` and its four tokens; `.kairos-type-card--sm` sets its size.
    - `.kairos-type-time` sets the mono family, `text-transform: none` and its four tokens.
16. **Headers.**
    - `tokens.css` source line: "Kairos design brief v3 (lock revision 3), 17 November 2026", keeping the sentence about role names and aliases.
    - `brand.css` header: "Kairos design brief v3 (lock revision 3, 17 November 2026)", with its comments rewritten without widths.
    - The typefaces comment in `tokens.css` says: Archivo names the apps' family at the Product Scale; `brand.css` sets Epilogue at the Brand Scale; the package ships no font. Group 6 rewrites it.
17. **Workshop fonts.** The workshop is a host app, so it loads families the way a host does: a Google Fonts link in `.storybook/preview-head.html` and `docs/preview.html`.
    - Core: `family=Archivo:wdth,wght@62..125,400..900&family=Epilogue:ital,wght@0,100..900;1,100..900&family=Courier+Prime:wght@400;700&display=swap`.
    - Group 6 drops Archivo from it.
    - No font file enters the repository.
18. **A Brand Scale host re-points the fonts under the Brand selector while group 6 is out.** `brand.css`'s rule is (0,2,0), so it beats a host's `:root` re-point. The core adoption text says: "at the Brand Scale, re-point `--kairos-display` and `--kairos-body` under `:root[data-scale='brand']`". Group 6 removes the need and rewrites that line.

## Brand Scale (`brand.css` after this change)

These are the tokens `tests/brand-scale.test.mjs` › `TABLE` must equal. `brand.css` sets exactly these.

- **Unchanged from 0.17.0** (copy as they are):
  - Shape: `--kairos-radius-button` 3px, `--kairos-radius-input` 3px, `--kairos-radius-panel` 2px.
  - Buttons: `--kairos-control-h` 50px, `--kairos-control-h-sm` 44px, `--kairos-button-pad-x` 26px, `--kairos-button-pad-x-sm` 18px, `--kairos-text-button` 16px, `--kairos-text-button-sm` 16px, `--kairos-button-weight` 700, `--kairos-button-case` none, `--kairos-track-button` 0.005em, and the five button shadow and hover tokens, `--kairos-button-press-transform` scale(0.98), `--kairos-control-duration`.
  - Surfaces: `--kairos-shadow`, `--kairos-shadow-card`, `--kairos-shadow-lg`, `--kairos-shadow-pressed`.
  - Fields: all field tokens except `--kairos-input-label-stretch`.
  - Focus.
  - `--kairos-text-body` 17px, `--kairos-text-body-lh` 1.6.
  - Motion.
- **Removed:** `--kairos-button-stretch`, `--kairos-input-label-stretch`, and every `--kairos-type-<rank>-stretch`.
- **Added (core; group 6 removes them again):** `--kairos-display` and `--kairos-body`, each `'Epilogue', ui-sans-serif, system-ui, sans-serif`.
- **Type ranks** (size, weight, leading, tracking):

| Rank | Size | Weight | Leading | Tracking | Was (0.17.0) |
|---|---|---|---|---|---|
| display | `clamp(31px, 3.8vw, 50px)` | 800 | 1.06 | -0.02em | `clamp(38px, 4.4vw, 62px)`, 1.04, -0.015em, 118% |
| display phone (`--kairos-type-display-phone-size`) | `clamp(31px, 3.8vw, 50px)` | | | | `clamp(34px, 9.4vw, 40px)` |
| title | `clamp(35px, 4.6vw, 63px)` | 800 | 1.06 | -0.02em | `clamp(42px, 5.6vw, 76px)`, -0.015em, 118% |
| title compact (`--kairos-type-title-compact-size`, new) | `clamp(35px, 3.8vw, 52px)` | | | | new |
| h2 | `clamp(26px, 2.7vw, 37px)` | 800 | 1.08 | -0.015em | `clamp(30px, 3.3vw, 44px)`, -0.01em, 118% |
| h3 | `clamp(19px, 1.8vw, 24px)` | 800 | 1.15 | 0 | `clamp(22px, 2.2vw, 28px)`, 112% |
| card (new) | 20px | 800 | 1.15 | 0 | new |
| card small (`--kairos-type-card-sm-size`, new) | 19px | | | | new |
| quote | `clamp(21px, 2vw, 27px)` | 700 | 1.3 | 0 | `clamp(24px, 2.4vw, 32px)`, 108% |
| lead | `clamp(18px, 1.55vw, 20px)` | 400 | 1.55 | 0 | same |
| statement | `clamp(19px, 1.7vw, 22px)` | 600 | 1.4 | 0 | same |
| body | 17px | 400 | 1.6 | 0 | same |
| small | 15px | 400 | 1.6 | 0 | same |
| legal | 14px | 400 | 1.6 | 0 | same |
| label | 15px | 700 | 1.6 | 0 | same |
| price | 21px | 700 | 1.6 | 0 | same |
| time (new) | 16px | 400 | 1.6 | 0 | new |
| button | 16px | 700 | 1.6 | 0.005em | same, was 108% |
| nav | 16px | 600 | 1.6 | 0 | same |

- **Tick-list knobs (new):** `--kairos-tick-list-value-size` `clamp(19px, 1.6vw, 21px)`, `--kairos-tick-list-value-phone-size` 18px, `--kairos-tick-list-value-leading` 1.35.

Each new token gets a Product Scale default in `tokens.css` (Decided 5-8). Each new `-size` default is a 0.14 step, so "every type rank has a Product Scale size from the 0.14 type scale" holds.

## Apps against 0.17.0 (the 0.17.0 guard)

Copy `dist/tokens.css`, `dist/base.css`, `dist/kairos.css` and `dist/brand.css` from `d36d95c` into `tests/fixtures/kairos-design-0.17.0/` byte for byte. In `tests/product-scale.test.mjs`, add three tests. They reuse the file's own parsing and Product Scale resolution (light and dark), keyed as the 0.14 test keys them:
- "the 0.17.0 fixture is the published 0.17.0": the four sha256 values above.
- "every 0.17.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.18 lists": tokens by name, and `base.css`/`kairos.css` declarations by context, selector and property.
- "a new 0.18 rule on a 0.17.0 class is Brand-scoped or listed".

The lists are constants in that file:

- `GONE_0_18` (keys absent in 0.18.0):
  - tokens: the 16 `--kairos-*-stretch` tokens;
  - `kairos.css` `font-stretch` on `.kairos-menu-link`, `.kairos-tick-list-value`, `.kairos-step-line-title`, `.kairos-site-menu-row`, each of the 14 `.kairos-type-<rank>` blocks, `:root[data-scale='brand'] .kairos-button` and `:root[data-scale='brand'] .kairos-input-label`;
  - `transform` on `.kairos-marker::after`.
- `CHANGED_0_18` (key, its 0.18.0 value at the Product Scale): `--kairos-site-menu-row-size` 23px; `.kairos-site-menu-row` `font-size` 23px.
- `NEW_0_18` (new declarations whose selector names a 0.17.0 class, each with its reason in a comment):

| Selector | Properties | Reason |
|---|---|---|
| `.kairos-type-label, .kairos-type-price` | `text-transform` | P1; inert at the Product Scale unless an app puts a type label inside an uppercase typed label (`text-transform` is inherited) |
| `.kairos-site-footer-heading` | `line-height`, `letter-spacing`, `text-transform` | P1; a Brand part |
| `.kairos-title-bar::after`, `.kairos-marker::after` | `rotate` | P2; a Brand part |
| `.kairos-tick-list--statement .kairos-tick-list-value` | `font-size`, `line-height` | P6; resolves to what it was |
| `.kairos-tick-list-value` inside `@media (max-width: 520px)` | `font-size` | P6; resolves to the statement size at the Product Scale |
| `.kairos-site-menu-row[aria-current='page']` | `text-decoration-line`, `text-underline-offset` | P9; a Brand part |
| `.kairos-button:not([aria-busy='true']) .kairos-button-pending .kairos-spin` | `animation` | P10; the ring is hidden while idle |

  The last row also goes into a `NEW_0_18` check in the 0.14 test "a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale", beside `NEW_0_17`, because `.kairos-button`, `.kairos-button-pending` and `.kairos-spin` are 0.14 classes.

A declaration whose selector names only new classes (`kairos-type-title--compact`, `kairos-type-card`, `kairos-type-time`, `kairos-text-link-text`) is not policed by the guard. If the build needs a new declaration on a 0.16.0 Brand part that the table misses, add it to `NEW_0_18` with its reason and name it in the summary. One on any other 0.17.0 class (an app class) is a finding: block the card.

**Group 6 adds** (only when it runs):
- `CHANGED_0_18`: `--kairos-display` and `--kairos-body` = `'Epilogue', ui-sans-serif, system-ui, sans-serif`, both themes. Token entries in `CHANGED_0_18` are applied to 0.17.0's token map before its declarations are resolved, as `INTENTIONAL` is in the 0.14 test, so the 14 declarations that read these two tokens (13 in `kairos.css`, 1 in `base.css`) resolve equal and need no entries of their own.
- `GONE_0_18`: `font-stretch` on the three type-block rules at `kairos.css:6158-6182` (`:root:not([data-scale='brand']) :where(h1, h2, h3, h4, h5, h6)`, the section-heading rule, the product-name rule).
- The 0.14 test's `INTENTIONAL` entries for `--kairos-display` and `--kairos-body` take the Epilogue stack.

## Apps follow Epilogue (task group 6, separable)

The reviewer's call: do the apps move from Archivo to Epilogue too? **Recommendation: yes.** The brand has one sans family, and the reviewer said earlier that the website's look is the brand for the apps.

Group 6 does five things:
1. `tokens.css` `--kairos-display` and `--kairos-body` name the Epilogue stack.
2. `brand.css` deletes its two family lines.
3. The three `font-stretch` declarations of 0.17.0's type block go. Every other declaration there stays: sentence case, weights 800/700, tracking, line height, Courier labels, the product name's capitals.
4. The tests and guard lists follow (above).
5. The workshop, preview page, Type page, README, manifest and adoption guide stop naming Archivo except as history. The grep CHECK proves it.

**If the answer is no**, group 6 (tasks 6.1-6.2) and `specs/kairos-design-apps-epilogue/` are deleted from this change. That is a plan edit and a new plan id. What remains ships:
- Apps keep 0.17.0's Archivo with its 112%/106%/100% widths. `tokens.css` names Archivo.
- `brand.css` carries Epilogue at (0,2,0), so the website must re-point its fonts under `:root[data-scale='brand']`. Otherwise the package's plain stack replaces its `next/font` stack and drops the metric-adjusted fallback.
- The workshop and preview page load Archivo, Epilogue and Courier Prime.
- The website plan's checks that no Archivo reaches its built CSS (pre-card check and C7.1) fail on the package's Archivo stacks in `tokens.css`, and need rewording in the website plan.

## Tests that change

- `tests/product-scale.test.mjs`: the 0.17.0 tests and lists above. `NEW_0_18` is read by the 0.14 new-rule test too. With group 6: the `INTENTIONAL` font values, and "0.17.0's Product type block is kept apart from its widths" (every fixture declaration under the `:root:not([data-scale='brand'])` prefix is in `dist/` with the same value, except `font-stretch`, which is absent).
- `tests/brand-scale.test.mjs`:
  - `RANKS` loses its width column and takes the table above.
  - `TABLE` drops the two width knobs and gains the font rows, the new ranks and the tick knobs; `--kairos-type-display-phone-size` is the new clamp.
  - New tests: "no width token is declared" and "kairos.css sets font-stretch only in the apps' type block".
  - Group 6: delete the font rows from `TABLE`; add "brand.css sets no font family" and "no stylesheet sets font-stretch".
- `tests/brand-tokens.test.mjs`: add "at the Brand Scale the font tokens name Epilogue and Courier Prime" (resolve `tokens.css` `:root` then `brand.css`'s rule). Group 6 renames "the font tokens name Archivo and Courier Prime" to "the font tokens name Epilogue and Courier Prime" and makes it expect the Epilogue stack.
- `tests/brand-parts.test.mjs`: add
  - "label ranks and the footer heading undo the heading capitals",
  - "the title bar and the marker tilt with rotate, not transform",
  - "the compact title, card and time ranks read their tokens",
  - "tick list values read their own size knobs",
  - "the statement tick list keeps the statement rank",
  - "the text link wraps its label and arrow in one span",
  - "phone menu rows are 23px and the current one is underlined".

  Extend "every shared part from the brief has its class" with the four new classes.
- `tests/contract.test.mjs`: add "a loadable button's spinner turns only while busy". Change no existing test.
- `tests/release.test.mjs`:
  - In "the docs describe 0.16.0", delete only the `tokensHeader` assertions (they move to 0.18.0).
  - Add "the docs describe 0.18.0" and "every name the website reads is still declared" (reads `tests/fixtures/website-reads.txt`, a copy of `input/website-reads.txt`; `#` lines are comments).
  - Group 6 adds "the docs tell apps to load Epilogue".
  - The pack test stays as it is and must still pass with 44 files.
- `tests/scale.test.mjs`, `tests/emit.test.mjs`, `tests/contrast.test.mjs` and every other test: unchanged, and they must pass.

## Workshop

- `.storybook/preview-head.html` and `docs/preview.html`: the font link of Decided 17; comments name the families honestly.
- `stories/brand/Foundations.stories.tsx` › "Type Ranks":
  - Add `card`, `card--sm` (rendered as `kairos-type-card kairos-type-card--sm`), `time` and `title--compact` specimens, and an `h3.kairos-type-label`.
  - Display: Epilogue, 800, `fontStretch` `100%`.
  - Body: Epilogue, 17px at 1.6.
  - Label, price and time: Courier Prime.
  - Every rank: `fontStretch` 100%.
  - Card: 20px/800 at 1.15; card small: 19px; time: 16px/400 at 1.6.
  - The `h3` label: `text-transform: none`.
  - Compact title: 800 with no case transform. Its size is viewport-relative, so assert none.
- `stories/brand/Actions.stories.tsx`:
  - "Buttons": the idle and busy spinner `animationName` (P10).
  - "Links": the text link in the wrapped markup (P8).
  - "Without The Switch": expects `textTransform` `none` (0.17.0's sentence case).
- `stories/brand/Shell.stories.tsx`:
  - "Header And Footer": footer heading `textTransform` none and line height 24px.
  - "Phone Menu": one row gets `aria-current="page"`; assert 23px rows and the underline (P9).
- `stories/brand/Surfaces.stories.tsx` › "Placeholders And Marker": `rotate` `-1deg` and `transform` none on both `::after` (P2).
- `stories/foundations/Type.stories.tsx` › "The families": core names Epilogue for display and body at the Brand Scale beside the apps' Archivo, and drops "set wide". Group 6 makes it Epilogue only.
- No new story exports; the count stays the same.
- No assertion on text width, the viewport or a hover.

## Docs

- `docs/decisions.md`, a new section "Brand type on Epilogue, 0.18.0". Earlier sections are history and stay. It says:
  - Epilogue at the Brand Scale, no widths, and the lock revision 3 sizes.
  - The 16 width tokens removed, and why.
  - P1-P6 and P8-P10 in one line each, and P7 dropped with its reason.
  - Group 6 adds one paragraph: the apps moved to Epilogue and lost `font-stretch`.
- `docs/adoption.md`, "Upgrading to 0.18.0" above "Upgrading to 0.17.0". It names:
  - the hosts that load Epilogue (`next/font/local`, `weight: '100 900'`, no width axis, upright preloaded and italic not) and Courier Prime 400/700;
  - the font tokens `--kairos-display`, `--kairos-body`, `--kairos-mono`;
  - the removed `-stretch` tokens;
  - the new classes `kairos-type-title--compact`, `kairos-type-card` (`--sm`), `kairos-type-time` and `kairos-text-link-text`, with the text link's new markup;
  - the core line of Decided 18.

  Group 6 replaces that line with the apps paragraph: load Epilogue, drop Archivo from the loader, keep re-pointing the tokens on `:root`, and expect normal-width headings.
- `README.md` › Fonts: Epilogue for the Brand Scale; group 6 makes it every surface. It points at "Upgrading to 0.18.0". The Brand table row names "Kairos design brief v3".
- `docs/kairos-ui.md`:
  - The type-rank row adds `kairos-type-title--compact`, `kairos-type-card`, `kairos-type-card--sm` and `kairos-type-time`, and drops "width".
  - The text-link row takes P8's wording.
  - The site-menu row adds the current row.
  - Group 6: line 91 names the display family without "(Archivo)".
- Public repository: no client names, job numbers or internal paths in any file.

## P1-P10 against 0.17.0

| # | On 0.17.0 | In 0.18.0 |
|---|---|---|
| P1 | Holds at the Brand Scale (`kairos.css:5231-5234`, `5101-5107`). At the Product Scale 0.17.0's heading rule already sets sentence case | Fixed (Decided 10), without a width |
| P2 | Holds (`5195-5203` has no tilt; `5191` marker uses `transform`) | Fixed with `rotate` on both (Decided 11) |
| P3 | Holds (one title size) | `kairos-type-title--compact`, rev 3 `clamp(35px, 3.8vw, 52px)` (Decided 5) |
| P4 | Holds | `kairos-type-card` 20px, `--sm` 19px, 800/1.15 (Decided 6) |
| P5 | Holds | `kairos-type-time` 16/400 (Decided 7) |
| P6 | Holds (`4855-4862` reads the statement rank) | Knobs at 21/18px, 1.35 (Decided 8) |
| P7 | On hold | Dropped (Decided 9) |
| P8 | Holds (docs row 451; `4355-4386`) | Docs and `kairos-text-link-text` (Decided 12) |
| P9 | Holds (`5036-5046` has no current state) | Current-row underline, plus rev 3's 23px rows (Decided 13, 4) |
| P10 | Holds (`178-180`, `2169-2183`) | Idle spinner still (Decided 14) |

## Risks / Trade-offs

- [Removing 16 tokens in a minor] → Only the website uses 0.16+ tokens and reads none of them (the fixture test). Listed in the adoption guide.
- [Epilogue is about 12% wider than Archivo 400 at body sizes] → Body-size apps text runs longer with group 6. The planner's Product Scale compare looks for it, and each app's bump plan takes shots.
- [The guard lists are long] → Each entry names its P-item. A key the lists miss fails the test, so nothing moves silently.
- [Brand fonts in `brand.css` without group 6 beat a host's `:root` re-point] → Decided 18 and the adoption line. Group 6 removes it.
- [0.17.0 went out without a plan; another release may land while this one is built] → The planner checks `npm view kairos-design versions` and `main` before the pull request, and takes the next minor if 0.18.0 is taken (release practice).

## Migration Plan

1. Build (one card), then the planner's review rerun and browser checks.
2. Pack a pre-release for the website (after task 6.1, or after 4.1 without group 6), and run the website's own package test against it.
3. Move the plan to the store, open the pull request, merge (= publish 0.18.0), check the registry, and run an install test from npm.
4. The website card pins 0.18.0. Rollback: the website keeps its 0.16.0 pin until its card passes. A broken 0.18.0 gets a 0.18.1 fix; nothing installs it by range.
