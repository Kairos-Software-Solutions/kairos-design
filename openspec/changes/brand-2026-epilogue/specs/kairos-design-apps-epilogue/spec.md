## Purpose
Move the apps' Product Scale from Archivo to Epilogue so every Kairos surface uses one sans family at its normal width, keeping 0.17.0's sentence case, weights, tracking and geometry, and leave Archivo named only in records of earlier releases.

## ADDED Requirements

### Requirement: Apps name Epilogue
At the Product Scale `--kairos-display` and `--kairos-body` SHALL name Epilogue followed by system fallbacks, and `brand.css` SHALL set no font family, so the families live in `tokens.css` alone and a host re-points them on `:root` at either scale.

#### Scenario: Product font stacks
- **WHEN** `--kairos-display`, `--kairos-body` and `--kairos-mono` are read from `tokens.css` in light and dark
- **THEN** display and body are `'Epilogue', ui-sans-serif, system-ui, sans-serif` and mono begins with `'Courier Prime'`
- **CHECK** `tests/brand-tokens.test.mjs` › "the font tokens name Epilogue and Courier Prime"

#### Scenario: One place for the family
- **WHEN** the declarations of `brand.css` are read
- **THEN** it sets none of `--kairos-display`, `--kairos-body` and `--kairos-mono`
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css sets no font family"

### Requirement: The apps' type block keeps 0.17.0 apart from width
The rules of 0.17.0's apps type block (each beginning `:root:not([data-scale='brand'])`) SHALL keep every declaration they had except `font-stretch`, which SHALL be gone, so no stylesheet in `dist/` sets a width and the apps keep 0.17.0's sentence case, weights, tracking and geometry.

#### Scenario: No width anywhere
- **WHEN** every stylesheet in `dist/` is read with comments stripped
- **THEN** none holds a `font-stretch` declaration
- **CHECK** `tests/brand-scale.test.mjs` › "no stylesheet sets font-stretch"

#### Scenario: Case, weight and geometry kept
- **WHEN** every declaration of the 0.17.0 fixture's `kairos.css` whose selector begins `:root:not([data-scale='brand'])` is looked up in `dist/kairos.css` by at-rule context, selector and property
- **THEN** each one other than `font-stretch` is present with the same value, and no `font-stretch` is present
- **CHECK** `tests/product-scale.test.mjs` › "0.17.0's Product type block is kept apart from its widths"

#### Scenario: Apps against 0.17.0 in the workshop
- **WHEN** the Product Scale stories `Components/Button`, `Components/Forms`, `Screens/Sign In` and `Screens/Record List` are built once with the 0.17.0 fixture CSS and once with 0.18.0, and their computed styles are compared per element at 1366
- **THEN** they differ only in `font-family` (Archivo to Epilogue) and `font-stretch` (to 100%), and the idle spinner's animation
- **CHECK** planner computed-style compare in the review sandbox (Workflow follow-up)

### Requirement: Archivo only in history
The shipped stylesheets, the workshop, the README, the manifest and the preview page SHALL name Archivo only where a line records an earlier release, and the workshop and the preview page SHALL load only Epilogue and Courier Prime.

#### Scenario: Grep
- **WHEN** `dist/`, `stories/`, `.storybook/`, `README.md`, `docs/kairos-ui.md` and `docs/preview.html` are searched for "Archivo"
- **THEN** every match is on a line that names 0.16, 0.17 or 0.18 as history, and the two font links name no Archivo
- **CHECK** `grep -rn "Archivo" dist stories .storybook README.md docs/kairos-ui.md docs/preview.html | grep -v -E '0\.1[678]'` prints nothing, and `grep -c "family=Archivo" docs/preview.html .storybook/preview-head.html` prints 0 for each file, both recorded in `checks/REPORT.md`

### Requirement: The docs tell apps to load Epilogue
The "Upgrading to 0.18.0" section SHALL tell an app to load Epilogue (variable, weight 100-900, no width axis) and Courier Prime, to drop Archivo from its loader, and to re-point the font tokens on `:root`; `docs/decisions.md`'s 0.18.0 entry SHALL say the apps moved to Epilogue and lost their widths.

#### Scenario: Upgrading for apps
- **WHEN** the "Upgrading to 0.18.0" section of `docs/adoption.md` and the 0.18.0 entry of `docs/decisions.md` are read
- **THEN** the section names Epilogue, `100 900`, Courier Prime, `:root` and Archivo (as the family to drop), and the entry names `font-stretch` and Epilogue
- **CHECK** `tests/release.test.mjs` › "the docs tell apps to load Epilogue"
