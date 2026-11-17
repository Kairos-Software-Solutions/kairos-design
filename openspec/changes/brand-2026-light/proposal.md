# Proposal: brand-2026-light

## Why

The Kairos design brief v1 (approved 17 Nov 2026, "Work sheet in the logo's yellow") is now the Kairos brand for every Kairos app, and its technical lock lists the colours, fonts, geometry and component vocabulary the shared package must carry. The reviewer's words: "The kairos-design package now needs to follow this brief, and the website qa needs to prove it." The website is the first surface on it; the apps move to it later, one at a time, each on the reviewer's yes. A dark theme comes later from the designer ("Have the designer do that after the light theme is on qa"), so this change is the light theme only.

## What Changes

- **Release 0.15.0.** A minor version: under 0.x, `^0.14.0` stops below 0.15.0, so no app receives it until its own bump plan. The website pins it first.
- **Colour tokens follow the brief (light).** The brief's role names become the token names (`--kairos-page`, `--kairos-card`, `--kairos-band`, `--kairos-tint`, `--kairos-picked`, `--kairos-ink`, `--kairos-ink-2`, `--kairos-ink-3`, `--kairos-highlight`, `--kairos-highlight-strong`, `--kairos-tick`, `--kairos-placeholder`, `--kairos-error`, `--kairos-on-error`, the role aliases, and a decorative `--kairos-rule`), in hex. Every 0.14 token name keeps working: a renamed role keeps its old name as an alias that resolves to the same value. One existing light value moves: `--kairos-accent-hover` becomes the brief's `#ffb627`.
- **Fonts follow the brief.** The family tokens name Archivo (body and display) and Courier Prime (mono). The package ships no font files, no `@font-face` and no font URL; each app loads the families itself.
- **New opt-in entry point `kairos-design/brand.css`** (Brand Scale). It moves the existing parts and a new type scale to the brief's geometry: 3px controls and 2px panels, soft card shadows with the hard ink offset only on button hover, 50px buttons and 52px fields, wide heavy headings, the 3px focus ring and the brief's motion curve and durations. It applies only where the root element carries `data-scale="brand"`. It holds no colour value. Without it, every existing class renders exactly as in 0.14 apart from the fonts and the primary hover fill.
- **Shared parts from the brief's Component vocabulary land in `kairos.css`:** text link, menu link, language link, tick box, picked day grid, time-of-day switch, error line and required mark, soft card, inset band, section band, tint cards, tick list, step line, site header, phone menu and footer shells, placeholder text and photo slot, marker and title bar, the type ranks and the content wrapper. `Field`, `InputField`, `Textarea` and `SelectField` gain the required mark; `Button` needs no API change.
- **Site-only parts stay out:** the logo reel and spotlight panel, the reel's no-pause rule, the form topics, the review days, the verse card and founder photo tilts, the review-line wording and the WhatsApp message. Arrival and reveal choreography (the brief's M3–M8 and R10 timings) is site code.
- **Dark stays as it is.** Every 0.14 dark value is kept. The new colour roles get interim dark values reused from the existing dark palette, so both themes pass the contrast suite; the designer's dark card replaces them in a later release.
- **Release workflow:** the version tag is pushed only after `npm publish` succeeds, so a failed publish can be rerun.
- Docs: `docs/decisions.md` (0.15.0 entry), `docs/adoption.md` ("Upgrading to 0.15.0"), `docs/kairos-ui.md` rows for every new class, two ADRs, README. The workshop gets a Brand section and loads the two new families.

## Capabilities

### New Capabilities
- `kairos-design-brand-tokens`: the colour, font and role tokens the brief defines, their names, the aliases that keep 0.14 names working, the decorative hairline, interim dark values, and the guarantee that Product Scale renders as 0.14 did apart from the listed changes.
- `kairos-design-brand-scale`: the opt-in `brand.css` entry point, how it is switched on, what it may and may not hold, and the brief's geometry, type and motion it applies to existing parts.
- `kairos-design-brand-parts`: the shared parts from the brief's Component vocabulary as classes (and the Field required mark), their states, and the site-only parts the package must not carry.
- `kairos-design-release-0-15`: the 0.15.0 package surface (version, exports, packed files, no fonts) and the release workflow publishing before it tags.

### Modified Capabilities
None. The kairos-design specs in the `kairos-plans` store (`button`, `field`, `data-table`, `accessibility`, `record-card`) still hold as written at both scales: equal boxes across ranks, two disabled signals, one message slot, reduced motion, 3:1 control boundaries. This change validates outside the store (`design.md` › Decided 12), so it adds requirements rather than modifying store specs. The open store change `kairos-design-framework-update-2026-11` pins shipped files to 0.14.0; how that is reconciled is in `design.md` › Decided 12.

## Impact

- Shipped files: `dist/tokens.css`, `dist/kairos.css`, new `dist/brand.css`, `dist/react/Field.tsx`, `package.json` (version, `exports`), `README.md`, `docs/kairos-ui.md`. `dist/base.css`, `bin/`, `dist/format/` and every other React module stay as they are.
- Repo only: `tests/` (new tests and a 0.14.0 fixture), `stories/brand/`, `.storybook/` (brand switch, fonts link), `docs/decisions.md`, `docs/adoption.md`, `docs/adr/`, `.github/workflows/publish.yml`.
- Consumers: none until they bump. Website, Paykit, Card, Mailkit, Uptime and aikit stay pinned to `^0.14` in this change. On a bump an app sees the two new font families (it must load them) and the brighter primary hover, nothing else unless it opts into `brand.css`.
- Release: merging the version bump to `main` publishes 0.15.0 (trusted publishing, no token). Covered by the reviewer's standing yes for releasing kairos-design 0.15.0.
- Out of scope: the dark redesign (designer card, later release), every app's bump, the website build, the reel component, and the `kairos-branding` skill text in `ai-files` (follow-up).
