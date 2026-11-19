## Purpose
Define what the apps' Product Scale (no `data-scale` attribute) draws where kairos-design 0.19.0 changes it: 16px body text and readable button labels on phones with desktop sizes kept, and the hard ink stamp kept for rank-1 buttons while every surface takes the brief's soft card shadow, with the Brand Scale unchanged.

## ADDED Requirements

### Requirement: Body text and button labels are larger on phones
At the Product Scale, below 900px (`max-width: 899px`, the sidebar boundary), `--kairos-text-body` SHALL be `1rem` (16px), `--kairos-text-button` `0.875rem` (14px) and `--kairos-text-button-sm` the 13px step, set by one `:root` rule in `tokens.css`. From 900px all three SHALL keep their 0.18.0 values (14px, 12px, 11px). Every rule and role that reads them follows without its own edit.

#### Scenario: Phone sizes
- **WHEN** the `@media (max-width: 899px)` rule on `:root` in `dist/tokens.css` is read and its values are resolved through the light token map
- **THEN** it sets `--kairos-text-body` to `1rem`, `--kairos-text-button` to `0.875rem` and `--kairos-text-button-sm` to `var(--kairos-text-md)`, which resolve to `1rem`, `0.875rem` and `13px`
- **CHECK** `tests/product-type-and-stamp.test.mjs` › "below 900px body text is 16px and button labels 14px and 13px"

#### Scenario: Desktop sizes kept
- **WHEN** the top-level `:root` values of the three tokens are resolved and every `min-width` query in `dist/tokens.css` is read
- **THEN** they resolve to `0.875rem`, `12px` and `11px`, and no `min-width` query sets any of them
- **CHECK** `tests/product-type-and-stamp.test.mjs` › "from 900px body text and button labels keep their 0.18.0 sizes"

#### Scenario: Phone sizes in the workshop
- **WHEN** the Type page's "Phone Sizes" story renders a `kairos-body` paragraph, a primary button and a small button without the Brand Scale
- **THEN** with `matchMedia('(max-width: 899px)')` matching, their computed font sizes are 16px, 14px and 13px, and otherwise 14px, 12px and 11px
- **CHECK** `npm run test-stories`: `stories/foundations/Type.stories.tsx` › "Phone Sizes" passes

### Requirement: The Brand Scale keeps its type on phones
The phone rule SHALL NOT reach the Brand Scale: `brand.css` SHALL keep setting `--kairos-text-body` (17px), `--kairos-text-button` and `--kairos-text-button-sm` (16px) under `:root[data-scale='brand']`, whose (0,2,0) specificity outranks the phone rule's `:root`, and `brand.css` SHALL be byte-identical to 0.18.0's.

#### Scenario: Brand outranks the phone rule
- **WHEN** `dist/brand.css` and the phone rule in `dist/tokens.css` are read
- **THEN** `brand.css`'s only rule is `:root[data-scale='brand']` and sets the three tokens to 17px, 16px and 16px, and the phone rule's selector is exactly `:root`
- **CHECK** `tests/product-type-and-stamp.test.mjs` › "the Brand Scale keeps its body and button sizes on phones"

#### Scenario: brand.css untouched
- **WHEN** the final commit is compared with `725c182` (0.18.0)
- **THEN** `dist/brand.css` is unchanged
- **CHECK** `git diff --exit-code 725c182 -- dist/brand.css` exits 0, recorded in `checks/REPORT.md` (task 6.2)

### Requirement: Only rank-1 buttons wear the stamp
At the Product Scale the hard ink stamp SHALL be carried by `--kairos-shadow-stamp` (4px), `--kairos-shadow-stamp-hover` (6px) and `--kairos-shadow-pressed` (2px), read only through the button knobs, and SHALL appear only on `kairos-button--primary`, `kairos-button--danger-solid` and `kairos-page-header-primary`, at rest, under the cursor and held, light and dark (linen on dark).

#### Scenario: Ink offsets only on rank 1
- **WHEN** every `kairos.css` declaration of `box-shadow`, `--button-shadow`, `--button-shadow-hover`, `--button-shadow-active` or a `--kairos-*shadow*` knob is resolved at the Product Scale in light and dark
- **THEN** every value that is an ink offset (`Npx Npx 0` in `#16110b` or `#f5f1e8`) is on one of the three rank-1 selectors, and each of them resolves to 4px at rest, 6px on hover and 2px held
- **CHECK** `tests/product-type-and-stamp.test.mjs` › "only rank-1 buttons wear the ink stamp at the Product Scale"

#### Scenario: The page header's primary reads the knobs
- **WHEN** the `.kairos-page-header-primary` rule is read
- **THEN** it sets `--button-shadow`, `--button-shadow-hover` and `--button-shadow-active` to `var(--kairos-button-shadow-rest)`, `var(--kairos-button-shadow-hover)` and `var(--kairos-button-shadow-active)`
- **CHECK** `tests/product-type-and-stamp.test.mjs` › "the page header's primary reads the button stamp knobs"

### Requirement: Surfaces take the soft card shadow
At the Product Scale `--kairos-shadow`, `--kairos-shadow-card` and `--kairos-shadow-lg` SHALL resolve to `--kairos-shadow-soft-card`, so panels, cards, disclosures, dialogs, popovers, the overflow and select menus, toasts and the skip link wear the soft card shadow in both themes. A panel or card nested in a panel SHALL stay flat.

#### Scenario: Soft surfaces
- **WHEN** the `box-shadow` of `.kairos-skip-link`, `.kairos-disclosure`, `.kairos-disclosure-group`, `.kairos-panel`, `.kairos-card`, `.kairos-dialog-content`, `.kairos-overflow-menu`, `.kairos-combobox-menu`, `.kairos-popover` and `.kairos-toast` is resolved at the Product Scale
- **THEN** each is `0 14px 30px -20px rgba(71, 55, 40, 0.32)` in light and `0 14px 30px -20px rgba(0, 0, 0, 0.5)` in dark, and the nested-panel rule still sets `box-shadow: none` on its nine selectors
- **CHECK** `tests/product-type-and-stamp.test.mjs` › "surfaces wear the soft card shadow at the Product Scale"

#### Scenario: Elevation in the workshop
- **WHEN** the Geometry page's "Elevation" story renders a panel holding a nested panel, a card, a primary and a secondary button without the Brand Scale
- **THEN** the outer panel and the card report the soft card shadow, the nested panel `none`, the primary `rgb(22, 17, 11) 4px 4px 0px 0px`, and the secondary no shadow
- **CHECK** `npm run test-stories`: `stories/foundations/Geometry.stories.tsx` › "Elevation" passes

#### Scenario: Before and after in the workshop
- **WHEN** the Product Scale stories (Components/Button, Forms, Overlays, Feedback, Density, Screens/Record list, Sign in) and the Brand stories are built once with the 0.18.0 fixture CSS and once with 0.19.0, and computed styles are compared per element at 390, 820 and 1366, light and dark
- **THEN** at the Product Scale the only differences are font sizes reading the body or button steps below 900px and the box shadows of the ten surfaces, and the Brand stories that switch the Brand Scale on show none
- **CHECK** planner, before the pull request (Workflow follow-up)
