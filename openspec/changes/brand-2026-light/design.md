# Design: brand-2026-light

## Context

`kairos-design` is the shared Kairos design system, published to public npm as `kairos-design` (0.14.0, `main` at `09dbce8`). It has no build step: `dist/` holds hand-edited CSS and TypeScript source that apps compile themselves. `package.json` › `files` ships `dist`, `bin` and `docs/kairos-ui.md` (plus `package.json` and `README.md`).

- `dist/tokens.css` is the only file with raw colour: a light `:root` block, a dark `[data-theme='dark']` block inside `@media not print` that redeclares only what changes, then a theme-independent `:root` block (type, space, geometry, motion). Themes are set on the root element (`dist/react/theme.tsx` writes `document.documentElement.dataset.theme`).
- `dist/kairos.css` (4,926 lines, about 220 class families) reads tokens only. `dist/base.css` sets the page. `dist/react/*.tsx` emit `kairos-*` classes and hold no styling.
- `npm test` runs `node --test tests/*.test.mjs` with no browser and no install: `contrast` (computed WCAG pairs, both themes, follows `var()` aliases, hex only), `scale` (no literal spacing, radius, tracking, font size, shadow, duration or easing; every token read by something), `contract` (classes, exports, manifest rows, no hex outside tokens, components hold no styling), `geometry`, `theme`, `emit`, `format`, `sort`, `confirm`.
- `npm run test-stories` renders every story in headless Chromium with axe (`a11y: { test: 'error' }`), CI only. `npm run typecheck`, `npm run build-storybook`.
- `.github/workflows/publish.yml`: on a push to `main` it publishes when `v<version>` is not tagged yet; today it pushes the tag before `npm publish`.

The approved look is the Kairos design brief v1 (owner brief, approved 17 Nov 2026) and its technical lock (lock revision 1, same day). The builder reads the lock in `input/brief/` (git-ignored): `design-brief.md` (its "Component vocabulary" marks each part shared or site), `theme.css` (role tokens `--kd-*`, oklch with the approved hex in each comment), `contrast.md` (41 computed pairs), `reference/` and `shots/`. Specs and tasks name the brief by version, never by path.

## Research

Read on 17 Nov 2026 in the job folder (`09dbce8`) and the lock inputs:

- **The 0.14 light palette already is the brief's core.** page `#fff8eb` = `--kairos-bg`, card `#ffffff` = `--kairos-surface`, ink `#16110b` = `--kairos-text`, ink-2 `#473728` = `--kairos-text-2`, ink-3 `#79624a` = `--kairos-text-muted`, highlight `#ffc247` = `--kairos-accent`. Differences: highlight-strong `#ffb627` against `--kairos-accent-hover` `#e6a92d`, and the roles 0.14 lacks (band, tint, picked, green, placeholder, error, hairlines, soft shadow).
- **Name clashes.** The brief's `--kd-accent` is the green; `--kairos-accent` is the amber every app's primary button reads. The brief's `--kd-border` is a 20% hairline; `--kairos-border` is the ink container edge (50 uses). Neither 0.14 name can take the brief's meaning without repainting the apps, so the brief's green and hairline get new names (Decided 3).
- **Contrast test needs hex** (`channels()` asserts "is not a plain hex colour") and resolves `var()` aliases across the light and dark blocks, splitting the file at the first `[data-theme='dark']`. A translucent token is fine as long as no test pairs it (`--kairos-overlay` is `rgba()` today).
- **Custom properties inherit computed values.** An alias declared on `:root` (`--kairos-bg: var(--kairos-page)`) resolves on `:root`; a descendant that sets `data-theme` would inherit the already-resolved light value. Declaring the alias block on `:root, [data-theme]` re-resolves it on every themed element. The same applies to `brand.css`: role tokens built from other tokens on `:root` do not re-resolve under a scale switch set lower down, so the switch belongs on the root element, as the theme does.
- **Contrast of the new roles** (computed here with the contrast test's formula): light placeholder on elevated 4.59, tick on elevated 4.75, `--kairos-border-subtle` on band 3.39 / tint 3.10 / picked 3.28. Interim dark candidates from the existing dark palette: dark ink on `#2e2720` 13.05, on `#1e2c22` 12.95, on `#2e2415` 13.51; dark ink-3 (`#b9ae9c`) on those 6.72 / 6.67 / 6.96; `#8fcba1` as the green on dark page/card/elevated 9.75 / 8.84 / 7.86; `#e9a08a` as placeholder and error 8.56 / 7.76 / 6.91; `#16110b` on `#e9a08a` 8.81. Every pair clears its floor.
- **Product Scale stamp and the brief's press shadow.** `.kairos-button--primary` sets `--button-shadow: var(--kairos-shadow)` (4px stamp at rest), hover `var(--kairos-shadow-card)` (6px) with a -2px/-2px lift, active `var(--kairos-shadow-pressed)` (2px). The brief has no shadow at rest, the 4px ink offset on hover with the same lift, and none on press. `--kairos-shadow-card` is also the card stamp, which the brief replaces with a soft shadow, so the button needs its own knobs (Decided 6).
- **Focus.** 0.14 draws a 2px ink outline at a literal 2px offset with a 2px amber inner ring (`--kairos-focus-w`). The brief draws a 3px ink outline at 3px offset and no inner ring.
- **Fields.** `.kairos-input-field` is `--kairos-control-h` (36px) tall with an ink border, 16px text, elevated hover; the label is 12px uppercase. The brief: 52px (textarea 120px), 2px ink-3 border, 18px/500 text, a 15px/700/105% sentence-case ink label, tint fill on focus, a red asterisk on required fields, and an error line with a 20px round "!" badge.
- **Motion.** 0.14: `--kairos-ease` `(0,0,.2,1)`, 120/200/450ms; reduced motion collapses every `kairos-` animation and transition to `--kairos-duration-none: 1ms` (a 0s animation may not fire `animationend`). The brief: `(.2,.75,.25,1)`, 160/260/560ms, plus `ease-in` and `ease-pop`, and 0ms under reduced motion.
- **Fonts.** 0.14 names Bebas Neue (display, uppercase page titles), Epilogue (body) and the system mono. The workshop loads its families with a Google Fonts link in `.storybook/preview-head.html`. The brief's `fonts/fonts.css` is `@font-face`; Payload sites load fonts with `next/font/local`, and the starter's font test refuses `@font-face` and Google Fonts.
- **Pinned tests this change meets:** `scale` › "every token is read by something" searches `kairos.css`, `base.css` and `dist/react` only; `contract` › "no custom property is referenced without a definition or a fallback" reads `kairos.css` and `tokens.css` only; `contract` › "every artifact is reachable through the package exports" lists every `dist/*.css`, so `brand.css` must be exported; `contract` › "every class has a manifest row, or a documented block" covers every new class; `emit` derives its artifact list from `dist`, so `brand.css` becomes emittable with no CLI change.
- **Release workflow.** "Create and push the version tag" runs before "Publish". If the publish fails, the rerun finds the tag and writes "Nothing to release", so the version never ships without a manual tag deletion. Moving the tag step after the publish is a step reorder with no logic change.
- **Consumers.** Website, Paykit, Card, Mailkit, Uptime and aikit pin `^0.14.0`; each lockfile resolves 0.14.0. Under 0.x, `^0.14.0` excludes 0.15.0.
- **Store.** `openspec/config.yaml` names the `kairos-plans` store, which is not registered on the build hosts, so the CLI refuses to work in place. In the store, `kairos-design-framework-update-2026-11` is still an open change; its `kairos-design-release-surface` capability requires shipped files to stay byte-identical to 0.14.0.

Before numbers (planner's run at `09dbce8`, Node 26.12.1, npm 11.20.0, no install needed for `npm test`): `npm test` 112 tests, 112 pass, 0 fail. `npm pack --dry-run`: 42 files, 140,564 bytes packed, 464,988 unpacked. `dist/kairos.css` 165,447 bytes (43,322 gzip -9), `dist/tokens.css` 21,263 (7,691 gzip -9). Story tests: 67 in 16 files, all passing, from the builder's run of the same story files on 12 Nov (job-056 `checks/stories-after.json`); not rerun here, since the story run needs an install and Chromium. Task 1.1 records the builder's own baseline.

## Decided (standing yes, recommendations taken)

1. **Version 0.15.0.** A minor release. Consumers stay on `^0.14` and are not bumped here; each app moves on its own plan and the reviewer's yes.
2. **Renamed roles: the brief's name becomes the token, the 0.14 name stays as an alias.** The table in Token map lists them. Values do not change (except `--kairos-accent-hover` light, Decided 4). The aliases live in their own block with the selector `:root, [data-theme]`, placed after the light block and before the dark block, so an old name re-resolves wherever a theme is set. The dark block redeclares the canonical names with the 0.14 dark values. Existing rules in `kairos.css` and `base.css` keep reading the old names (no churn, same values); new rules read the new names.
3. **New names where the brief's name is taken.** The brief's green is `--kairos-tick` (its first job; also the step line and the selected ring). The brief's 18% hairline is `--kairos-rule` and its 20% tile and photo edge is `--kairos-rule-frame` (research section 2, conflict 6). `--kairos-accent` keeps meaning amber and `--kairos-border` keeps meaning the ink edge.
4. **Light values come from the brief, in hex.** Every brief colour is written as its approved hex (the comment value in the lock's `theme.css`), never oklch. One 0.14 light value moves: `--kairos-accent-hover` (now an alias of `--kairos-highlight-strong`) from `#e6a92d` to `#ffb627` (ink on it 10.70:1). The translucent lines and the soft shadow colour stay `rgba()` as the brief has them: they are decorative and must read the same on cream, white and both greens.
5. **Fonts are shared tokens.** `--kairos-body` and `--kairos-display` become `'Archivo', ui-sans-serif, system-ui, sans-serif`; `--kairos-mono` becomes `'Courier Prime', 'Courier New', ui-monospace, monospace`. No new family names (one name per role, as `docs/decisions.md` › Tokens already rules). The package never ships a font file, `@font-face` or a font URL; apps load the families (Payload sites with `next/font/local`, others as today). Product Scale keeps its case and size rules, so an app's page title becomes Archivo where it was Bebas Neue.
6. **Two layers of tokens.** Role tokens carry the brief's colours and meanings and are the same at both scales (`--kairos-field-border` is ink-3, `--kairos-control-edge` is ink). Component knobs (`--kairos-button-*`, `--kairos-input-*`, `--kairos-focus-*`, `--kairos-type-*`) are what existing rules read where the brief changes an existing part; their defaults in `tokens.css` reproduce 0.14 exactly, and `brand.css` re-points them. A knob default may be a literal or a `var()` to a 0.14 token; the Product Scale test decides whether it is right.
7. **Brand split (research Q4).** Colours and fonts are shared. The website's geometry goes in the new opt-in `dist/brand.css`: radii, control and field heights, button and label type, the stamp replaced by soft shadows with the hard ink offset on button hover only, the 3px focus ring, the type ranks at the brief's sizes, and the brief's motion curve and durations. Apps that bump keep their shape.
8. **How the Brand Scale switches on.** `brand.css` is one rule, `:root[data-scale='brand'] { … }`, holding only custom properties. Importing it changes nothing until the root element carries `data-scale="brand"`, which the website sets on `<html>` and the workshop sets per story. Reasons: specificity (0,2,0) beats the light block and the dark block without `!important`; the import order (tokens, brand, components) stops mattering; the workshop can render both scales in one build; and an app can opt one page in. It holds no colour value (only `var()` references to colour tokens), no class rule, no `@font-face`, no `url()`, and never sets `--kairos-duration-none`.
9. **Reduced motion keeps 1ms**, not the brief's 0ms (the reason recorded on `--kairos-duration-none`). The existing reduced-motion block already covers every `kairos-` element, including the new parts.
10. **Shared parts become `kairos.css` classes.** Every part the brief's Component vocabulary marks shared lands as a class family (Shared parts table). Existing React components change only where the package already has the part: `Field` (and through it `InputField`, `Textarea`, `SelectField`) renders the required mark; `Button` already has the brief's busy state (label swap, ring, width held, presses refused) and its ranks map onto the brief's main and outline buttons. No new React component. New parts take colour from role tokens, sizes from new tokens holding the brief's values (they have no 0.14 shape to keep), and type from the type-rank tokens, so they follow the scale.
11. **Site parts stay out of the package:** the logo reel and its spotlight panel (the brief marks the reel "shared component" with a pause control by default; the reviewer's recommendation keeps it out of 0.15, SUMMARY › Needs your call), the reel's no-pause rule (R5), form topics, the days a review is offered, the verse card and founder photo tilts, the review-line wording, the WhatsApp message, which sections use band or tint, and the arrival and reveal choreography (M3–M8, R10 timings, the 480ms reveal). The package ships each part in its final state plus its state-change transitions (M1, M2, M9).
12. **Where the change lives.** The CLI cannot validate in place because of the `store:` line, so the planner validates in a scratch copy without it and the builder does the same (task 7.3); `openspec/config.yaml` is not edited. The capabilities are ADDED-only and prefixed `kairos-design-`, as the last kairos-design change did. Before the pull request the planner moves the change into `kairos-plans` as `kairos-design-brand-2026-light`. The open store change `kairos-design-framework-update-2026-11` pins shipped files to 0.14.0; the planner archives it first and scopes those two requirements to toolchain-only changes in the same store commit (Workflow follow-up), which is the reviewer's call in SUMMARY.
13. **Dark.** Every 0.14 dark value stays. New colour roles get interim dark values taken from the existing dark palette (no new hue invented), marked `/* interim: the dark card replaces this */`. Both themes pass the whole contrast suite, the new pairs included. The workshop's Brand stories render light only; the website is light only until the dark card.
14. **Release workflow fixed in this change**: "Create and push the version tag" moves after "Publish", unchanged otherwise. Small and safe: a step reorder, proven by a test reading the workflow. The workflow's other behaviour (skip when the tag exists, trusted publishing) is untouched.
15. **Source of truth.** The header of `tokens.css` names the Kairos design brief v1 (approved 17 November 2026) instead of the `kairos-branding` skill. The skill's own text is in another repository and is a follow-up, not part of this change.
16. **Workshop fonts.** `.storybook/preview-head.html` loads Archivo (variable weight and width) and Courier Prime 400/700 from Google Fonts in place of Bebas Neue and Epilogue, as it loads fonts today. This is the workshop only; nothing ships. No font files enter the repository, so no licence text is needed in it.

## Token map

### Renamed roles (0.14 name kept as an alias)

| Token (canonical) | 0.14 alias | Light | Dark (0.14 value, unchanged) |
| --- | --- | --- | --- |
| `--kairos-page` | `--kairos-bg` | `#fff8eb` | `#1a1410` |
| `--kairos-card` | `--kairos-surface` | `#ffffff` | `#231e18` |
| `--kairos-ink` | `--kairos-text` | `#16110b` | `#f5f1e8` |
| `--kairos-ink-2` | `--kairos-text-2` | `#473728` | `#e0d7c8` |
| `--kairos-ink-3` | `--kairos-text-muted` | `#79624a` | `#b9ae9c` |
| `--kairos-highlight` | `--kairos-accent` | `#ffc247` | `#ffc247` |
| `--kairos-highlight-strong` | `--kairos-accent-hover` | `#ffb627` (was `#e6a92d`) | `#e6a92d` |
| `--kairos-on-highlight` | `--kairos-accent-text` | `#16110b` | `#16110b` |
| `--kairos-focus-ring` | `--kairos-focus` | `#16110b` | `#ffc247` |

Every other 0.14 token keeps its name and value (`--kairos-elevated`, `--kairos-sidebar`, `--kairos-border`, `--kairos-border-subtle`, `--kairos-accent-disabled`, `--kairos-accent-on-light`, invert, focus-inner, state palette, danger, rows, skeleton, overlay, stamp, all geometry, space, type and motion tokens).

### New colour roles

| Token | Light (brief) | Interim dark (from the 0.14 dark palette) | Brief use |
| --- | --- | --- | --- |
| `--kairos-band` | `#f1f6ec` | `#2e2720` (dark elevated) | full-width section band |
| `--kairos-tint` | `#e3eedc` | `#1e2c22` (dark settled tint) | inset band, tint card, outline hover, day hover, ticked box, focused field |
| `--kairos-picked` | `#fff0c4` | `#2e2415` (dark awaiting tint) | picked day, picked time |
| `--kairos-tick` | `#3d6f57` | `#8fcba1` (dark settled) | ticks, step line, selected ring; never text, never a fill |
| `--kairos-placeholder` | `#b93d10` | `#e9a08a` (dark overdue) | `[placeholder]` text |
| `--kairos-error` | `#b3261e` | `#e9a08a` (dark danger) | error text, badge, required mark, invalid edge |
| `--kairos-on-error` | `#ffffff` | `#16110b` | the "!" in the badge |
| `--kairos-rule` | `rgba(22, 17, 11, 0.18)` | `rgba(245, 241, 232, 0.18)` | decorative hairlines (rows, header and footer edge, legal rule, day-grid inner lines) |
| `--kairos-rule-frame` | `rgba(22, 17, 11, 0.2)` | `rgba(245, 241, 232, 0.2)` | photo slot edge |
| `--kairos-shadow-soft-color` | `rgba(71, 55, 40, 0.32)` | `rgba(0, 0, 0, 0.5)` | colour of every soft shadow |

### Brief role aliases (light; follow their target in dark)

`--kairos-link` → ink; `--kairos-link-underline` → highlight; `--kairos-link-underline-hover` → ink; `--kairos-field-border` → ink-3; `--kairos-control-edge` → ink; `--kairos-button-edge` → ink; `--kairos-required` → error; `--kairos-label` → ink-3. The brief's `button-shadow` is `--kairos-shadow-color` (already ink, linen in dark). Every alias must be read by something (the `scale` test), so add only those a rule reads.

### New shared tokens (theme-independent, brief values)

Soft shadows `--kairos-shadow-soft-card` (`0 14px 30px -20px var(--kairos-shadow-soft-color)`) and `--kairos-shadow-soft-photo` (`0 10px 22px -12px …`); `--kairos-shadow-press` (`4px 4px 0 0 var(--kairos-shadow-color)`); `--kairos-shadow-none` (`0 0 0 0 transparent`, a valid member of a shadow list where `none` is not); `--kairos-shadow-hairline` (`0 1px 0 0 var(--kairos-rule)`). Motion `--kairos-ease-in` `cubic-bezier(0.55, 0, 0.8, 0.3)` and `--kairos-ease-pop` `cubic-bezier(0.3, 1.4, 0.5, 1)`, plus a token for any brief duration no token holds (the 320ms error shake). Layout `--kairos-content-w` 1200px, `--kairos-gutter` `max(20px, calc((100% - var(--kairos-content-w)) / 2))`, `--kairos-site-header-h` 76px and 66px under 900px (the 899/900 boundary already in the register). Part sizes (tick box 28px, check box 24px, step box 42px and 40px under 520px, day cell 62px, error badge 20px, link underline 3px at 5px offset, marker 0.3em, title bar 2.2em × 0.16em, field row and tap targets 44–48px) as tokens, because `scale` refuses literals in spacing, radius and border positions; a size used once in a `width` or `height` may stay a token or a literal, whichever `scale` accepts.

## Brand Scale (`dist/brand.css`)

Selector `:root[data-scale='brand']`. Each row is a token the rule sets; "knob" means a new token whose `tokens.css` default reproduces 0.14.

| Token | Product Scale (tokens.css) | Brand Scale |
| --- | --- | --- |
| `--kairos-radius-button` | 0 | 3px |
| `--kairos-radius-input` | 4px | 3px |
| `--kairos-radius-panel` | 10px | 2px |
| `--kairos-control-h` / `-sm` | 36px / 32px | 50px / 44px |
| `--kairos-button-pad-x` / `-sm` (knobs) | `--kairos-pad-control` / `--kairos-space-md` | 26px / 18px |
| `--kairos-text-button`, `--kairos-text-button-sm` (knob) | 12px, `--kairos-text-xs` | 16px, 16px |
| `--kairos-button-weight`, `-stretch`, `-case` (knobs) | 900, 100%, uppercase | 700, 108%, none |
| `--kairos-track-button` | 0.14em | 0.005em |
| `--kairos-button-shadow-rest`, `-hover`, `-active` (knobs, primary and danger-solid) | `--kairos-shadow`, `--kairos-shadow-card`, `--kairos-shadow-pressed` | `--kairos-shadow-none`, `--kairos-shadow-press`, `--kairos-shadow-none` |
| `--kairos-button-secondary-hover-bg`, `-hover-shadow` (knobs) | `--kairos-elevated`, none | `--kairos-tint`, `--kairos-shadow-press` (lift as primary) |
| `--kairos-button-border-color` (knob, primary and secondary) | `--kairos-border` | `--kairos-button-edge` / `--kairos-control-edge` |
| `--kairos-shadow`, `--kairos-shadow-card`, `--kairos-shadow-lg` | ink stamps 4/6/8px | `--kairos-shadow-soft-card` |
| `--kairos-shadow-pressed` | 2px stamp | `--kairos-shadow-none` |
| `--kairos-input-h` (knob; textarea `--kairos-input-h-multi`) | `--kairos-control-h`; 80px | 52px; 120px |
| `--kairos-text-input`, `--kairos-input-weight` (knob) | 16px, 400 | 18px, 500 |
| `--kairos-input-border-color` (knob) | `--kairos-border` | `--kairos-field-border` |
| `--kairos-input-focus-bg` (read only by a Brand-scoped rule, see below) | `--kairos-card` | `--kairos-tint` |
| `--kairos-input-label-size`, `-case`, `-track`, `-color`, `-stretch` (knobs) | 12px, uppercase, `--kairos-track-label`, `--kairos-text-2`, 100% | 15px, none, 0, `--kairos-ink`, 105% |
| `--kairos-required-display`, `--kairos-error-badge-display` (knobs) | none, none | inline, inline-flex |
| `--kairos-field-error-color` (knob) | `--kairos-state-overdue` | `--kairos-error` |
| `--kairos-focus-outline-w`, `--kairos-focus-offset` (knobs), `--kairos-focus-w` | `--kairos-border-w-strong`, 2px, 2px | 3px, 3px, 0px |
| `--kairos-text-body`, `--kairos-text-body-lh` | 0.875rem, 1.5 | 17px, 1.6 |
| `--kairos-type-<rank>-size/-weight/-stretch/-leading/-tracking` for display, title, h2, h3, quote, lead, statement, body, small, legal, label, price, button, nav (`display-phone-size` under 520px) | the nearest 0.14 step for size (title 24px, h2 `--kairos-text-xl`, h3 `--kairos-text-lg`, body `--kairos-text-body`, small `--kairos-text-md`, label `--kairos-text-sm` …), weight 400 or 700, stretch 100%, leading 1.2 headings / 1.5 text, tracking 0 | the brief's Type scale table and lock values (display `clamp(38px, 4.4vw, 62px)` / 800 / 118% / 1.04 / -0.015em, phone `clamp(34px, 9.4vw, 40px)`; title `clamp(42px, 5.6vw, 76px)`; h2 `clamp(30px, 3.3vw, 44px)`; … body 17px / 400 / 100% / 1.6; label (mono) 15px / 700; price (mono) 21px / 700) |
| `--kairos-duration-fast`, `--kairos-duration`, `--kairos-duration-enter` | 120ms, 200ms, 450ms | 160ms, 260ms, 560ms |
| `--kairos-ease` | `cubic-bezier(0, 0, 0.2, 1)` | `cubic-bezier(0.2, 0.75, 0.25, 1)` |

Builders may add a knob the table misses when a brief value needs one; each follows the same rule (0.14 default, Brand Scale value from the brief) and is named in the summary.

Where the brief adds a declaration an existing rule never had and no default can be a no-op (0.14's focused field sets no background, so any default would override its hover ground), `kairos.css` may carry a Brand-scoped rule: a selector beginning `:root[data-scale='brand']` (for example `:root[data-scale='brand'] .kairos-input-field:focus-visible { background: var(--kairos-input-focus-bg); }`). Such a rule cannot match at Product Scale. `brand.css` itself stays custom properties only.

## Shared parts (`kairos.css`)

Each row: the brief's vocabulary number, the class block, what it covers. Markup is native HTML (links, buttons, `input type=checkbox|radio`, `fieldset`), so keyboard behaviour (arrow keys in a radio group, Space to pick) is the browser's.

| # | Class block | Covers |
| --- | --- | --- |
| 1, 2 | `kairos-button--primary`, `kairos-button--secondary` (existing) | main and outline button; Brand look through the knobs; leading icon slot 18px |
| 3 | `kairos-text-link` (+ `-arrow`, `--external`) | ink 700 text, 3px highlight underline at 5px offset, hover underline to ink and arrow nudge, 44px tap target |
| 4 | `kairos-menu-link` | header menu link, 44px tall; hover marker sweep (scaleX); `aria-current="page"` underline |
| 5 | `kairos-lang-link` (+ `--row`) | last menu item set off by a 1px × 18px ink-3 hairline; phone-menu row of 48px |
| 6 | `kairos-required`, `kairos-error-line` | asterisk (`aria-hidden`), standalone error line with the round badge and a one-time shake; Field's own error uses the badge at Brand Scale |
| 7 | `kairos-tick-box` (+ `-group`) | 24px square, 2px control edge, card fill, ✓ on tint when checked, 46px row, focus ring on the label |
| 8 | `kairos-day-grid` (+ `-cell`, `-weekday`, `-date`) | 5 columns, 2px control-edge outside, 1px rule inside, 62px cells; hover tint; picked fill plus a 2px ink frame inset 3px that pops (ease-pop); inset focus ring; `[aria-invalid='true']` edge in error |
| 9 | `kairos-time-switch` (+ `-option`, `-pill`) | 3-column track (any count 2–5), 2px control edge, one pill in picked fill sliding to the checked option, hidden until the first pick; invalid edge in error |
| 11 | `kairos-card--soft` (+ `kairos-card--soft-rounded`) | card fill, no border, soft card shadow, square or 2px |
| 12 | `kairos-inset-band` | tint box inside the content width with the brief's clamp padding |
| 13 | `kairos-section-band` | full-width band ground |
| 14 | `kairos-tint-card` (+ `--band`) | flat tint or band box (the verse tilt is site) |
| 15 | `kairos-tick-list` (+ `-item`, `-box`, `-label`, `-value`, `--statement`) | rule-separated rows, 28px box with a drawn tick in `--kairos-tick` |
| 16 | `kairos-step-line` (+ `-item`, `-box`, `-title`) | numbered mono boxes joined by 2px tick-green lines; box 1 highlight fill and ink edge; vertical under 520px |
| 18 | `kairos-site-header` (+ `-inner`, `-nav`, `-actions`) | white sticky shell at `--kairos-site-header-h` with the hairline shadow; the button-collapse rule (R3) is site code |
| 19 | `kairos-site-menu` (+ `-toggle`, `-row`) | phone sheet under the header, card fill, rule-divided rows; the toggle's two bars become ✕ when `aria-expanded="true"`; open, close, focus and scroll lock are site code |
| 20 | `kairos-site-footer` (+ `-columns`, `-heading`, `-link`, `-legal`) | card fill with a top rule, mono column headings, 46px links, legal line over a rule |
| 21 | `kairos-placeholder`, `kairos-photo-slot` | coral 600 bracketed text; striped tint slot in a white mat with a label box |
| 22 | `kairos-marker`, `kairos-title-bar` | yellow bar behind a marked phrase (-1° tilt) and under a page title, wiping in from the left |
| type | `kairos-type-<rank>` | the rank tokens, `text-wrap: balance` on headings and `pretty` on text, mono family for label and price |
| layout | `kairos-wrap` | padding-inline `--kairos-gutter`, never a max-width |

Card (#11) is a modifier rather than a new block because the brief's card is the same element role as `.kairos-card`; the modifier is new, so the existing card keeps its 0.14 look. The checkbox, day grid and time switch are new blocks rather than restyles of `kairos-checkbox-row` and `kairos-segmented`, whose 0.14 behaviour (filters with `aria-pressed`) differs from radio choice.

## Product Scale guarantee

The core promise to the apps: with no `data-scale` attribute, 0.15 renders every existing class as 0.14 did except for the listed intentional changes. Proven in `tests/product-scale.test.mjs` against byte copies of the published 0.14.0 `tokens.css`, `base.css` and `kairos.css` in `tests/fixtures/kairos-design-0.14.0/` (their sha256 equal the registry tarball's: `336b55c1…`, `6f0ad07b…`, `5c6557c6…`, from the last release's pack compare):

- Parse each stylesheet into declarations keyed by at-rule context (the chain of enclosing `@media`/`@supports` preludes, whitespace normalised), selector (normalised) and property, with an occurrence index for repeats.
- Resolve every `var(--kairos-…)` (with fallbacks) against that version's Product Scale token map, once for light and once for dark (dark = light map overlaid with the dark block, the way the cascade delivers it), recursively; other custom properties (`--button-*`) stay as written, since they are compared as declarations themselves.
- Expected = 0.14's declaration resolved with 0.14's tokens after applying the INTENTIONAL list; actual = 0.15's declaration resolved with 0.15's tokens. Every 0.14 key must exist in 0.15 with equal values, light and dark.
- INTENTIONAL (the whole list): `--kairos-display`, `--kairos-body`, `--kairos-mono` (the font stacks of Decided 5) in both themes, and `--kairos-accent-hover` light `#e6a92d` → `#ffb627`.
- A 0.15 declaration with no 0.14 key is allowed when every selector in its list names a class 0.14 did not define (a new part) or begins with `:root[data-scale='brand']` (a Brand-scoped rule). Otherwise it must be listed in the test's `ALLOWED_NEW` with the value it resolves to at Product Scale, which must leave the part as 0.14 drew it (for example `.kairos-field-error::before` resolving `display: none`). Each entry is named in the builder's summary for the reviewer.
- `base.css` is compared the same way and is not edited.

## Tests

New files (all under `node --test tests/*.test.mjs`, plain Node, no new dependency): `tests/brand-tokens.test.mjs`, `tests/product-scale.test.mjs`, `tests/brand-scale.test.mjs`, `tests/brand-parts.test.mjs`, `tests/release.test.mjs`, plus new tests in `tests/contrast.test.mjs`. Every new test is a top-level `test('<name>', …)`, as in the existing files (no `describe`), so a CHECK names it as `tests/<file>` › "<name>".

Existing tests that change, and only these:
- `tests/scale.test.mjs`: `surfaces` adds `dist/brand.css`, and "every token is read by something" also checks tokens declared in `brand.css` (so a knob only `brand.css` reads counts as read, and a dead Brand token fails).
- `tests/contract.test.mjs` › "no custom property is referenced without a definition or a fallback": `all` adds `dist/brand.css`.
- No other existing assertion is edited or loosened. If one fails, block the card with its output.

Story tests (`npm run test-stories`, headless Chromium with axe) in `stories/brand/`, each story with `parameters: { scale: 'brand' }` and a `play` function asserting computed values at rest with `getComputedStyle`. A decorator in `.storybook/preview.tsx` sets `document.documentElement.dataset.scale = 'brand'` for those stories and removes the attribute for every other story. The play functions check rest states and DOM state only (hover is not reachable from a play function; hover, press, focus rings and keyboard picking are the planner's browser checks). Assertions must not depend on the viewport width the runner uses. Expected story tests after: 67 + 13 = 80. The thirteen, by file (export names give the test titles): `Foundations.stories.tsx` "Colours", "Type Ranks"; `Actions.stories.tsx` "Buttons", "Links", "Without The Switch" (the one Brand-folder story with no `scale` parameter: it proves the decorator removed the attribute); `Form.stories.tsx` "Fields", "Choices", "Errors"; `Surfaces.stories.tsx` "Cards And Bands", "Lists", "Placeholders And Marker"; `Shell.stories.tsx` "Header And Footer", "Phone Menu". Titles under `Brand/…`.

## Workshop

`.storybook/preview.tsx` imports `../dist/brand.css` after `tokens.css` and before `kairos.css`, and adds the scale decorator; the Foundations pages pick up the new tokens by parsing `tokens.css` as today (the alias block sits after the light block, so `stories/tokens.ts` still reads the light block first). `.storybook/preview-head.html` swaps the font link (Decided 16). The storySort order adds `'Brand'` after `'Components'`.

## Docs

- `docs/decisions.md`: a "Brand, 0.15.0" section with the Decided list's reasons, the name clashes, the INTENTIONAL list and a release note.
- `docs/adoption.md`: "Upgrading to 0.15.0": what an app sees on bump (two font families it must load, with a `next/font/local` example and a link example; the brighter primary hover; nothing else), how to opt into the Brand Scale (`import 'kairos-design/brand.css'`, `<html data-scale="brand">`), the renamed tokens and their aliases, and that old names keep working.
- `docs/kairos-ui.md`: a row for every new class block, `brand.css` in the entry list at the top, and the import order tokens, base (optional), brand (optional), components.
- `docs/adr/0012-switch-the-brand-scale-on-at-the-root.md`, `docs/adr/0013-give-decorative-hairlines-their-own-token.md`, `docs/adr/0014-rename-a-role-and-keep-its-old-name.md`, in the existing ADR format.
- `README.md`: the `brand.css` entry and the fonts rule. No client names, job numbers or internal paths anywhere in shipped files or docs (the repository is public).

## Risks / Trade-offs

- [The builder card is large: about 20 new class families, a type scale, knobs on two existing parts, five test files and 13 stories.] → One card is kept because every part reads the same tokens and the tests interlock; the estimate is 5 hours (4–7). If the card runs long, the planner can split the shell parts (header, phone menu, footer) into a fix round under the same change.
- [A knob default that differs from 0.14 by a hair (a `none` written as `0 0 0 0 transparent`) silently changes every app.] → The Product Scale test compares resolved values for every 0.14 declaration in both themes.
- [Alias inheritance: an old name resolved on `:root` would carry light values into a dark sub-tree.] → The alias block selector includes `[data-theme]`, and a test pins it.
- [The Brand Scale switched on below the root would leave role tokens resolved at the root.] → `docs/adoption.md` and ADR 0012 say the attribute goes on `<html>`; the website plan sets it there.
- [Archivo is wider than Bebas Neue, so a long uppercase page title in an app may wrap where it did not.] → Apps see it only when they bump; each bump plan includes shots of its screens.
- [Interim dark values for the new roles are borrowed, not designed.] → Marked interim in the file; the designer's dark card replaces them; the website is light only.
- [Story assertions in Chromium can be flaky on computed values that depend on fonts loading.] → Assertions avoid metrics that depend on the font (widths of text); they read sizes, radii, colours, shadows and attributes.

## Migration Plan

1. Build on `change/brand-2026-light` from `09dbce8`; review and rerun every check in a throwaway sandbox.
2. Move the change into `kairos-plans`, drop `checks/` and the change from the branch, open the pull request, wait for green CI.
3. Merge to `main` = publish 0.15.0 (covered by the reviewer's standing yes). The workflow publishes, then tags `v0.15.0`.
4. Registry check and an install test from npm; then the website plan pins `0.15.0` and its QA proves the brief.

Rollback: an app never receives 0.15.0 without its own bump. If 0.15.0 is wrong, publish 0.15.1 with the fix (or `npm deprecate kairos-design@0.15.0`); unpublishing is not used.
