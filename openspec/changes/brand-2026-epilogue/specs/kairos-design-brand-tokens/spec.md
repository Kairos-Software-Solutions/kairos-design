## MODIFIED Requirements

### Requirement: Every 0.14 token name keeps working
Every custom property `dist/tokens.css` declared in 0.14.0 SHALL still be declared and SHALL resolve, in both themes, to its 0.14.0 value, except `--kairos-accent-hover` in light, `--kairos-track-button` (0.17.0) and the three font stacks. A role the brief renamed SHALL keep its 0.14 name as an alias of the new name, and the aliases SHALL re-resolve on any element that sets a theme.

#### Scenario: Old name, same value
- **WHEN** each token in the 0.14.0 fixture is resolved in the current release and in 0.14.0, light and dark
- **THEN** the values are equal, apart from `--kairos-accent-hover` light (#e6a92d to #ffb627), `--kairos-track-button` (0.14em to 0.01em, 0.17.0) and `--kairos-display`, `--kairos-body`, `--kairos-mono`
- **CHECK** `tests/brand-tokens.test.mjs` › "every 0.14 token name still resolves, to its 0.14 value unless listed"

#### Scenario: A renamed role keeps its old name
- **WHEN** the nine renamed roles are read (bg, surface, text, text-2, text-muted, accent, accent-hover, accent-text, focus)
- **THEN** each 0.14 name is declared as `var()` of its new name (page, card, ink, ink-2, ink-3, highlight, highlight-strong, on-highlight, focus-ring)
- **CHECK** `tests/brand-tokens.test.mjs` › "a renamed role keeps its old name as an alias"

#### Scenario: A theme set below the root
- **WHEN** the alias block's selector is read
- **THEN** it matches both `:root` and any element carrying `data-theme`, and it sits after the light block and before the dark block
- **CHECK** `tests/brand-tokens.test.mjs` › "old names re-resolve wherever a theme is set"

### Requirement: Fonts are named, never shipped
At the Brand Scale `--kairos-display` and `--kairos-body` SHALL resolve to Epilogue and `--kairos-mono` to Courier Prime, each followed by system fallbacks (Kairos design brief v3, lock revision 3). The package SHALL ship no font file, no `@font-face` rule and no font URL; the host loads the families.

#### Scenario: Font stacks
- **WHEN** `--kairos-body`, `--kairos-display` and `--kairos-mono` are resolved at the Brand Scale (`tokens.css`, then `brand.css`'s rule)
- **THEN** the first two begin with `'Epilogue'` and the third with `'Courier Prime'`, each with fallbacks after it
- **CHECK** `tests/brand-tokens.test.mjs` › "at the Brand Scale the font tokens name Epilogue and Courier Prime"

#### Scenario: No font in the package
- **WHEN** every stylesheet in `dist/` and the packed file list are read
- **THEN** no stylesheet holds `@font-face` or `url(`, and no packed file ends in `.woff`, `.woff2`, `.ttf` or `.otf`
- **CHECK** `tests/release.test.mjs` › "no font file, @font-face or font URL ships"

### Requirement: Product Scale renders as 0.14 did
Without the Brand Scale, every 0.14.0 token SHALL resolve by name to its 0.14.0 value and every 0.14.0 `base.css` and `kairos.css` declaration as it did, light and dark, apart from the listed changes: the font stacks, the light primary hover, 0.17.0's type layer and layout fixes (`CHANGED_0_17`, `NEW_0_17`) and 0.18.0's idle spinner (`NEW_0_18`). Any other new declaration on a 0.14 class SHALL be Brand-scoped or inert.

#### Scenario: The fixture is the published release
- **WHEN** the sha256 of each file in `tests/fixtures/kairos-design-0.14.0/` is computed
- **THEN** `tokens.css`, `base.css` and `kairos.css` match the published 0.14.0 tarball (`336b55c1…`, `6f0ad07b…`, `5c6557c6…`)
- **CHECK** `tests/product-scale.test.mjs` › "the 0.14.0 fixture is the published 0.14.0"

#### Scenario: Every 0.14 declaration resolves the same
- **WHEN** every token of the fixture's and of `dist/`'s `tokens.css` is resolved by name, and every declaration of their `base.css` and `kairos.css` is keyed by at-rule context, selector and property, each through its version's Product Scale tokens in light and in dark
- **THEN** every 0.14 token name and every 0.14 `base.css` and `kairos.css` key still exists with an equal value once the INTENTIONAL list is applied to 0.14's tokens, and each key in `CHANGED_0_17` has the value it lists
- **CHECK** `tests/product-scale.test.mjs` › "every 0.14 declaration resolves the same at Product Scale, light and dark"

#### Scenario: New rules on existing classes
- **WHEN** a current declaration has no 0.14 key and its selector names a class 0.14 defined
- **THEN** the selector begins with `:root[data-scale='brand']` or `:root:not([data-scale='brand'])`, or the declaration is listed in `ALLOWED_NEW` (inert at Product Scale), `NEW_0_17` or `NEW_0_18`
- **CHECK** `tests/product-scale.test.mjs` › "a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale"

#### Scenario: base.css untouched
- **WHEN** the final commit is compared with `d36d95c` (0.17.0)
- **THEN** `dist/base.css` is unchanged
- **CHECK** `git diff --exit-code d36d95c -- dist/base.css` exits 0, recorded in `checks/REPORT.md`

## ADDED Requirements

### Requirement: Apps render as 0.17.0 did
Without the Brand Scale, every token and every `base.css` and `kairos.css` declaration of the published 0.17.0 SHALL resolve in 0.18.0 as it did, light and dark, apart from the keys `design.md` › Apps against 0.17.0 lists as gone (`GONE_0_18`) or changed (`CHANGED_0_18`). A new declaration whose selector names a class 0.17.0 defined SHALL be Brand-scoped or listed in `NEW_0_18`.

#### Scenario: The 0.17.0 fixture is the published release
- **WHEN** the sha256 of each file in `tests/fixtures/kairos-design-0.17.0/` is computed
- **THEN** `tokens.css`, `base.css`, `kairos.css` and `brand.css` match the published 0.17.0 tarball (`648bc07e…`, `6f0ad07b…`, `c0e6be31…`, `6354771e…`)
- **CHECK** `tests/product-scale.test.mjs` › "the 0.17.0 fixture is the published 0.17.0"

#### Scenario: Every 0.17.0 declaration resolves the same
- **WHEN** every token and every `base.css` and `kairos.css` declaration of the 0.17.0 fixture and of `dist/` is resolved at the Product Scale in light and dark, keyed as the 0.14 test keys them
- **THEN** every 0.17.0 key exists with an equal value, except the keys in `GONE_0_18`, which are absent, and those in `CHANGED_0_18`, which have the value listed
- **CHECK** `tests/product-scale.test.mjs` › "every 0.17.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.18 lists"

#### Scenario: New 0.18 rules on 0.17 classes
- **WHEN** a 0.18.0 declaration has no 0.17.0 key and its selector names a class 0.17.0 defined
- **THEN** its selector begins with `:root[data-scale='brand']`, or it is listed in `NEW_0_18` with the reason `design.md` gives
- **CHECK** `tests/product-scale.test.mjs` › "a new 0.18 rule on a 0.17.0 class is Brand-scoped or listed"
