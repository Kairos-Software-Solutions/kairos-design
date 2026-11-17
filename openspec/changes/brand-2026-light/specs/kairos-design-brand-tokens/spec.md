# Spec Delta: kairos-design-brand-tokens

## Purpose

Carry the Kairos brand's colours, fonts and role names in the kairos-design token layer, keep every earlier token name working, and guarantee that an app not opted into the Brand Scale renders as it did on the previous release apart from a short, named list of changes.

## ADDED Requirements

### Requirement: Colour tokens carry the brief's light values
The light theme SHALL define the colour roles of Kairos design brief v1 (approved 17 November 2026) under `--kairos-*` names, each solid colour written as the brief's approved hex: page, card, band, tint, picked, ink, ink-2, ink-3, highlight, highlight-strong, tick (the brief's green), placeholder, error and on-error, plus the brief's role aliases a rule reads.

#### Scenario: Brief roles resolve to the brief's hex
- **WHEN** each role token is resolved in the light theme, following `var()` aliases
- **THEN** page is #fff8eb, card #ffffff, band #f1f6ec, tint #e3eedc, picked #fff0c4, ink #16110b, ink-2 #473728, ink-3 #79624a, highlight #ffc247, highlight-strong #ffb627, tick #3d6f57, placeholder #b93d10, error #b3261e and on-error #ffffff
- **CHECK** `tests/brand-tokens.test.mjs` › "the brief's light colours are the token values"

#### Scenario: Solid colours are plain hex
- **WHEN** every colour token in both theme blocks is read
- **THEN** each one is a plain hex value, except the translucent hairline, overlay and soft-shadow colours, which are `rgba()`
- **CHECK** `tests/brand-tokens.test.mjs` › "every solid colour token is plain hex"

### Requirement: Every 0.14 token name keeps working
Every custom property `dist/tokens.css` declared in 0.14.0 SHALL still be declared and SHALL resolve, in both themes, to its 0.14.0 value, except `--kairos-accent-hover` in light and the three font stacks. A role the brief renamed SHALL keep its 0.14 name as an alias of the new name, and the aliases SHALL re-resolve on any element that sets a theme.

#### Scenario: Old name, same value
- **WHEN** each token in the 0.14.0 fixture is resolved in 0.15 and in 0.14.0, light and dark
- **THEN** the values are equal, apart from `--kairos-accent-hover` light (#e6a92d to #ffb627) and `--kairos-display`, `--kairos-body`, `--kairos-mono`
- **CHECK** `tests/brand-tokens.test.mjs` › "every 0.14 token name still resolves, to its 0.14 value unless listed"

#### Scenario: A renamed role keeps its old name
- **WHEN** the nine renamed roles are read (bg, surface, text, text-2, text-muted, accent, accent-hover, accent-text, focus)
- **THEN** each 0.14 name is declared as `var()` of its new name (page, card, ink, ink-2, ink-3, highlight, highlight-strong, on-highlight, focus-ring)
- **CHECK** `tests/brand-tokens.test.mjs` › "a renamed role keeps its old name as an alias"

#### Scenario: A theme set below the root
- **WHEN** the alias block's selector is read
- **THEN** it matches both `:root` and any element carrying `data-theme`, and it sits after the light block and before the dark block
- **CHECK** `tests/brand-tokens.test.mjs` › "old names re-resolve wherever a theme is set"

### Requirement: Decorative hairlines are not control edges
Decorative hairlines SHALL use their own tokens (`--kairos-rule`, `--kairos-rule-frame`), never the control boundary token, and no control's resting edge SHALL be drawn with them. Control boundaries SHALL keep clearing 3:1 on every ground, the brief's band, tint and picked grounds included.

#### Scenario: Controls never take the rule
- **WHEN** the border and outline declarations of every control class are read (buttons, input fields, selects, segmented options, overflow trigger, tick box, day grid outer edge, time switch track)
- **THEN** none of them reads `--kairos-rule` or `--kairos-rule-frame`
- **CHECK** `tests/brand-tokens.test.mjs` › "the decorative rule is never a control edge"

#### Scenario: Control boundary floor kept on the new grounds
- **WHEN** `--kairos-border-subtle`, `--kairos-field-border`, `--kairos-control-edge`, `--kairos-focus-ring` and `--kairos-tick` are paired with page, card, band, tint and picked in both themes
- **THEN** every pair clears 3:1
- **CHECK** `tests/contrast.test.mjs` › "every brief non-text colour clears 3:1 on every brief ground", and the existing "a control boundary clears 3:1 on every ground it can sit on" still passes

### Requirement: Contrast holds in both themes
Text colours SHALL clear 4.5:1 and non-text signals 3:1 on every ground the brief places them on, in light and in dark, and the light figures SHALL equal the brief's contrast table.

#### Scenario: Text on the brief's grounds
- **WHEN** ink, ink-2, ink-3, placeholder and error are paired with page, card, band and tint, and ink and ink-3 with picked, in both themes
- **THEN** every pair clears 4.5:1
- **CHECK** `tests/contrast.test.mjs` › "every brief text colour clears 4.5:1 on every brief ground"

#### Scenario: Labels on the brief's fills
- **WHEN** on-highlight is paired with highlight and highlight-strong, and on-error with error, in both themes
- **THEN** every pair clears 4.5:1
- **CHECK** `tests/contrast.test.mjs` › "labels on the brief's fills clear 4.5:1"

#### Scenario: The brief's table is the token layer's
- **WHEN** the 41 rows of the brief's contrast table (all numeric) are computed from the light tokens and rounded to two decimals
- **THEN** each equals the brief's figure (for example ink on page 17.76, ink-3 on picked 5.06, ink on highlight-strong 10.70)
- **CHECK** `tests/contrast.test.mjs` › "the brief's contrast table is the token layer's"

#### Scenario: The existing contrast suite
- **WHEN** `node --test tests/contrast.test.mjs` runs after the change
- **THEN** every 0.14 test in it passes unchanged, alongside the new ones
- **CHECK** `checks/ci-commands.md` records the file's pass count, 0 failed, and `git diff 09dbce8 -- tests/contrast.test.mjs` shows only added tests

### Requirement: Dark keeps its 0.14 values until the dark redesign
Every 0.14 dark value SHALL stay as it is. Each new colour role SHALL have an interim dark value taken from the 0.14 dark palette (or, for a translucent role, a translucent value), marked as interim in `tokens.css`.

#### Scenario: Interim dark values come from the existing palette
- **WHEN** the dark value of each new solid colour role is read
- **THEN** it equals a value the 0.14.0 dark block already declares, and its declaration carries the word "interim" in a comment
- **CHECK** `tests/brand-tokens.test.mjs` › "the new colour roles take interim dark values from the 0.14 dark palette"

### Requirement: Fonts are named, never shipped
The font tokens SHALL name Archivo for body and display and Courier Prime for mono, each followed by system fallbacks. The package SHALL ship no font file, no `@font-face` rule and no font URL.

#### Scenario: Font stacks
- **WHEN** `--kairos-body`, `--kairos-display` and `--kairos-mono` are read
- **THEN** the first two begin with `'Archivo'` and the third with `'Courier Prime'`, each with fallbacks after it
- **CHECK** `tests/brand-tokens.test.mjs` › "the font tokens name Archivo and Courier Prime"

#### Scenario: No font in the package
- **WHEN** every stylesheet in `dist/` and the packed file list are read
- **THEN** no stylesheet holds `@font-face` or `url(`, and no packed file ends in `.woff`, `.woff2`, `.ttf` or `.otf`
- **CHECK** `tests/release.test.mjs` › "no font file, @font-face or font URL ships"

### Requirement: Product Scale renders as 0.14 did
Without the Brand Scale switched on, every 0.14.0 token SHALL resolve in 0.15 by name to its 0.14.0 value, and every declaration in the 0.14.0 `base.css` and `kairos.css` SHALL resolve to the value it had, light and dark, after only the listed intentional changes (the three font stacks and the light primary hover). A new declaration on an existing class SHALL be Brand-scoped or leave the part as 0.14 drew it.

#### Scenario: The fixture is the published release
- **WHEN** the sha256 of each file in `tests/fixtures/kairos-design-0.14.0/` is computed
- **THEN** `tokens.css`, `base.css` and `kairos.css` match the published 0.14.0 tarball (`336b55c1…`, `6f0ad07b…`, `5c6557c6…`)
- **CHECK** `tests/product-scale.test.mjs` › "the 0.14.0 fixture is the published 0.14.0"

#### Scenario: Every 0.14 declaration resolves the same
- **WHEN** every token of the fixture's and of `dist/`'s `tokens.css` is resolved by name, and every declaration of their `base.css` and `kairos.css` is keyed by at-rule context, selector and property, each through its version's Product Scale tokens in light and in dark
- **THEN** every 0.14 token name and every 0.14 `base.css` and `kairos.css` key exists in 0.15 with an equal value once the INTENTIONAL list is applied to 0.14's tokens
- **CHECK** `tests/product-scale.test.mjs` › "every 0.14 declaration resolves the same at Product Scale, light and dark"

#### Scenario: New rules on existing classes
- **WHEN** a 0.15 declaration has no 0.14 key and its selector names a class 0.14 defined
- **THEN** the selector begins with `:root[data-scale='brand']`, or the declaration is listed in the test's `ALLOWED_NEW` with a Product Scale value that leaves the part unchanged
- **CHECK** `tests/product-scale.test.mjs` › "a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale"

#### Scenario: base.css untouched
- **WHEN** the final commit is compared with `09dbce8`
- **THEN** `dist/base.css` is unchanged
- **CHECK** `git diff --exit-code 09dbce8 -- dist/base.css` exits 0, recorded in `checks/REPORT.md`
