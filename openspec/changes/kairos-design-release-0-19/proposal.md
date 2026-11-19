# Proposal: kairos-design-release-0-19

## Why

The Paykit redesign review (round 1, 18 November 2026) found two package values that make the apps hard work on a phone:

- Body text is 14px (`--kairos-text-body: 0.875rem`) and button labels 12px (`--kairos-text-button`, 11px on a small button), small for one-handed use between jobs.
- Every top-level panel wears the hard 6px ink stamp, and cards, menus, dialogs and toasts wear 4px or 8px ones. Cards look as pressable as buttons and compete with the screen's main action.

The reviewer took the recommendation: 16px body text on phones, and the hard ink stamp only on primary buttons, with soft shadows on cards and panels, as Kairos design brief v3 describes the look (white cards on a cream page, the logo's yellow kept for what matters, main buttons first). The package's Brand Scale already gives every surface the brief's soft card shadow. The reviewer then said "Yes publish" for this release. The round 1 prototype the reviewer looked at draws the same: 16px body (at every width there; the decision asks for phones), `--stamp: 4px 4px 0` ink on `.btn.primary` only, and the soft card shadow `0 14px 30px -20px` on cards and lists.

The apps take these values from kairos-design, so the change belongs in the package, not in each app.

## What Changes

- **Release 0.19.0**, a minor version. Under 0.x, `^0.17.0` and `^0.18.0` stop below it, so no app or site gets it until its own plan repins.
- **Phone type at the Product Scale.** Below 900px (the register's sidebar boundary, `max-width: 899px`, where the apps' bottom bar replaces the sidebar), `tokens.css` sets `--kairos-text-body` to `1rem` (16px), `--kairos-text-button` to `0.875rem` (14px) and `--kairos-text-button-sm` to the 13px step. From 900px every size stays as 0.18.0 has it. Everything that reads the body step follows: page text, table cells, banners, choice rows, page header descriptions, `kairos-type-body`.
- **The stamp only on rank-1 buttons.** Two new tokens, `--kairos-shadow-stamp` (4px) and `--kairos-shadow-stamp-hover` (6px), carry the stamp for the button knobs; `--kairos-shadow-pressed` (2px) stays the press. `--kairos-shadow`, `--kairos-shadow-card` and `--kairos-shadow-lg` become the brief's soft card shadow at the Product Scale, as `brand.css` already makes them at the Brand Scale. Panels, cards, disclosures, dialogs, popovers, menus, the select list, toasts and the skip link go soft; `kairos-button--primary`, `kairos-button--danger-solid` (the committing button of a confirmation) and the page header's primary keep the stamp. Nested panels stay flat.
- **The page header's primary reads the button knobs** instead of the raw shadow tokens, so it keeps its stamp at the Product Scale and behaves as the brand's main button at the Brand Scale.
- **Guards.** A byte copy of the published 0.18.0 stylesheets and a test that every 0.18.0 declaration resolves the same at the Product Scale apart from a named list (`CHANGED_0_19`: three shadow tokens and ten surface shadows) and the three phone tokens (`PHONE_0_19`). The 0.14 and 0.17.0 guards learn the same list. New tests pin the phone sizes, the Brand Scale's sizes on phones, and the stamp on rank-1 buttons only.
- **Workshop.** Two new stories, "Phone Sizes" on the Type page and "Elevation" on the Geometry page, assert the computed values; the Geometry page's stamp section is rewritten.
- **Docs.** "Upgrading to 0.19.0" in the adoption guide, a decisions entry, and the manifest's type table, stamp table and panel rows.

## Capabilities

### New Capabilities

- `kairos-design-product-scale`: what the apps' Product Scale draws where 0.19.0 changes it: phone body and button sizes, and the stamp kept for rank-1 buttons with soft surfaces.
- `kairos-design-release-0-19`: the 0.19.0 surface (version, exports, packed files), the website-names check, the 0.19.0 docs, and publish-then-tag after the merge.

### Modified Capabilities

- `kairos-design-brand-tokens`: the 0.14 token exceptions name the three shadow tokens; the 0.14 and 0.17.0 guards accept `CHANGED_0_19`; a new 0.18.0 guard.
- `kairos-design-release-0-18`: the 0.18.0 version requirement is removed (superseded by 0.19.0).

## Impact

- Shipped files: `dist/tokens.css`, `dist/kairos.css` (one rule's three custom properties and comments), `package.json` (`version`), `docs/kairos-ui.md`. `dist/brand.css`, `dist/base.css`, `dist/react/`, `dist/format/` and `bin/` stay byte-identical. The packed file list stays 0.18.0's 44 files.
- Repo only: `tests/` (a 0.18.0 fixture, one new test file, listed edits), `stories/foundations/Type.stories.tsx`, `stories/foundations/Geometry.stories.tsx`, `docs/adoption.md`, `docs/decisions.md`, `package-lock.json` (its two top `version` fields).
- Brand Scale (the website): no change on any part it uses. `brand.css` already sets the body, button and shadow tokens at (0,2,0), which beats the new phone rule and the new surface values. Only the page header's primary, an app part, now follows the brand button.
- Consumers (`design.md` › Consumers): none changes until it repins. The Paykit redesign (`paykit-redesign-shell`) repins to 0.19.0 and drops its local override file.
- Release: merging to `main` publishes 0.19.0 (trusted publishing). The merge and the registry checks are the planner's, after review, under the reviewer's "Yes publish".
- Out of scope:
    - field labels, hints, chips, table headers and nav rows on phones (they keep 0.18.0's sizes);
    - control heights and the 44px touch target;
    - the dark redesign (dark surfaces take the interim soft shadow colour);
    - any app's repin, any React module change, `brand.css`.
