# Proposal: brand-2026-epilogue

## Why

The reviewer changed the brand's type: "archivo looks too stretched out and big for me". Kairos design brief v3 (17 November 2026, technical lock revision 3) sets every sans part in **Epilogue** (variable, weight 100-900, normal width; headings 800, body 400) and keeps **Courier Prime** for labels, prices, times and dates. It removes every width setting ("Never set `font-stretch`") and re-sets the heading sizes to the new pairing. kairos-design 0.17.0 still names Archivo and still sets widths, so the website can't follow the brief until the package does.

The website's QA also found ten package items (P1-P10, written against 0.16.0). Nine still hold on 0.17.0; one (P7) is on hold because lock revision 2 draws the phone date on two lines on purpose.

## What Changes

- **Release 0.18.0**, a minor version. Under 0.x, `^0.17.0` stops below it, so no app gets it until its own bump plan. The website pins it first.
- **Brand Scale fonts.** At the Brand Scale (`data-scale="brand"`), `--kairos-display` and `--kairos-body` name Epilogue; `--kairos-mono` stays Courier Prime. The package still ships no font file, `@font-face` or font URL. The docs say which families a host loads and how (`next/font`).
- **No width in the brand layer.** Every `--kairos-*-stretch` token goes from `tokens.css` and `brand.css` (16 tokens), and every `font-stretch` declaration that read them goes from `kairos.css` (20 declarations, two whole Brand-scoped rules). Only 0.17.0's apps type block still sets a width, and group 6 removes those three too.
- **Brand type follows lock revision 3:** display `clamp(31px, 3.8vw, 50px)` at every width, page title `clamp(35px, 4.6vw, 63px)`, h2 `clamp(26px, 2.7vw, 37px)`, h3 `clamp(19px, 1.8vw, 24px)`, quote `clamp(21px, 2vw, 27px)`, with the brief's line heights and tracking. Phone menu rows go from 26px to 23px. Every other rank keeps its size.
- **QA package fixes against 0.17.0:**
  - P1: label, price and footer headings drop the heading capitals at the Brand Scale.
  - P2: the title bar tilts -1°, and the marker tilts through `rotate`, not `transform`.
  - P3: a compact page title (`kairos-type-title--compact`).
  - P4: a card heading rank (`kairos-type-card`, `--sm`).
  - P5: a time rank (`kairos-type-time`).
  - P6: tick-list values sit a step under the statement rank.
  - P8: the text link wraps its label and arrow in `kairos-text-link-text`.
  - P9: the phone menu marks the current page.
  - P10: an idle button's spinner stands still.
  - P3-P6 sizes come from the lock revision 3 type table.
  - **P7 is dropped:** lock revision 2 puts the phone date on two lines under 560px on purpose, and P7 would undo that.
- **Apps follow Epilogue (task group 6, separable, the reviewer's call).** The Product Scale font tokens name Epilogue too. `brand.css` stops setting a family, and the apps type block loses its 112%, 106% and 100% widths. 0.17.0's sentence case, weights, tracking and geometry stay. Archivo is then named only in records of earlier releases. If the reviewer says no, group 6 and the `kairos-design-apps-epilogue` spec drop out, and the apps stay on Archivo at 0.17.0's widths (`design.md` › Apps follow Epilogue).
- **Workshop and docs:** the workshop and preview page load Epilogue. The Brand stories assert the new type, the P-fixes and normal width. "Without The Switch" now expects 0.17.0's sentence-case button. The docs get "Upgrading to 0.18.0", a decisions entry, README fonts and manifest rows.
- **Guards:** a 0.17.0 fixture and a test that every 0.17.0 declaration resolves the same at the Product Scale, apart from listed changes. A test that every class and token the website reads is still declared. The existing pack test.

## Capabilities

### New Capabilities
- `kairos-design-release-0-18`: the 0.18.0 surface (version, exports, packed files), the website-names check, the 0.18.0 docs, and publish-then-tag after the merge.
- `kairos-design-apps-epilogue`: the apps' Product Scale on Epilogue at normal width (task group 6 only; dropped whole if the reviewer says no).

### Modified Capabilities
- `kairos-design-brand-tokens`: the font requirement names Epilogue at the Brand Scale. The 0.14 guards now list 0.17.0's changes (spec drift from the 0.17.0 release, which had no plan) and 0.18.0's. A new 0.17.0 guard is added.
- `kairos-design-brand-scale`: lock revision 3 values, the type ranks without width, sentence case in "Without The Switch", no width in the brand layer, and the compact title, card and time ranks.
- `kairos-design-brand-parts`: P1, P2, P6, P8 and P9.
- `button`: P10, the idle spinner.
- `kairos-design-release-0-16`: the 0.16.0 version requirement is removed (superseded). Its docs requirement names no Bebas and expects the workshop to load Epilogue.

## Impact

- Shipped files: `dist/tokens.css`, `dist/brand.css`, `dist/kairos.css`, `package.json` (`version`), `README.md`, `docs/kairos-ui.md`. No React module, no `base.css`, no `bin/` or `dist/format/` change. The packed file list stays 0.17.0's 44 files.
- Repo only: `tests/` (new tests, a 0.17.0 fixture, a website-names fixture, the listed edits), `stories/brand/`, `stories/foundations/Type.stories.tsx`, `.storybook/preview-head.html`, `docs/adoption.md`, `docs/decisions.md`, `docs/preview.html`, `package-lock.json` (its two top `version` fields).
- Consumers:
  - The website (0.16.0 today) pins 0.18.0 in its own plan. It reads none of the removed width tokens, and every name it reads is checked.
  - Paykit, Card, Mailkit, Uptime and aikit stay on `^0.14` until their own bump plans. On a bump they get 0.17.0's type and, with group 6, Epilogue instead of Archivo.
- Release: merging to `main` publishes 0.18.0 (trusted publishing). The publish step is the planner's, after review.
- Out of scope:
  - the day-grid two-line date (lock revision 2, B11; was P7);
  - the brief's rev 2 parts the package lacks (dropdown, accordion, alert, time grid, contents list, article card, reading column, back link);
  - the review-line rank (Courier 15/400; site wording);
  - the service and article page title sizes (site);
  - every app's bump;
  - the dark redesign.
