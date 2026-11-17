## REMOVED Requirements

### Requirement: The package is 0.16.0 with a brand.css entry
**Reason**: The version moved on (0.17.0, then 0.18.0), so a requirement pinning 0.16.0 is no longer true of the package.
**Migration**: `kairos-design-release-0-18` › "The package is 0.18.0 and keeps its entry points" carries the version and the exports, `./brand.css` included.

## MODIFIED Requirements

### Requirement: The docs describe the release
The adoption guide SHALL keep its "Upgrading to 0.16.0" section naming the font families an app loaded then, when an app's font actually changes, the Brand Scale switch and the renamed tokens; `docs/decisions.md` SHALL record 0.16.0. The manifest, the preview page and the workshop SHALL name no Bebas, and the Colour page SHALL keep a swatch group for every light colour token.

#### Scenario: Docs present
- **WHEN** `docs/adoption.md` and `docs/decisions.md` are read
- **THEN** the adoption guide has a heading "Upgrading to 0.16.0" whose section names Archivo, Courier Prime, `brand.css`, `data-scale="brand"` and the three font tokens `--kairos-display`, `--kairos-body` and `--kairos-mono`, and decisions.md has a heading containing "0.16.0" (the `tokens.css` header check moved to "the docs describe 0.18.0")
- **CHECK** `tests/release.test.mjs` › "the docs describe 0.16.0"

#### Scenario: No 0.14 family named
- **WHEN** `docs/kairos-ui.md`, `docs/preview.html`, `.storybook/` and `stories/` are searched for "Bebas", and the font links of `docs/preview.html` and `.storybook/preview-head.html` are read
- **THEN** no line outside a code comment names Bebas, and both links load Epilogue and Courier Prime
- **CHECK** `grep -rn "Bebas" docs/kairos-ui.md docs/preview.html .storybook stories | grep -v -E ':[0-9]+:\s*(//|/?\*)'` prints nothing, and `grep -c "family=Epilogue" docs/preview.html .storybook/preview-head.html` prints 1 for each file, both recorded in `checks/REPORT.md`

#### Scenario: Every light colour token keeps its swatch
- **WHEN** the first `:root {` block of `dist/tokens.css` (the block `stories/tokens.ts` reads) and the `group(themed, …)` stems in `stories/foundations/Colour.stories.tsx` are read
- **THEN** every token in that block other than the `--kairos-shadow` tokens starts with one of the stems, so neither a renamed role nor a new colour role is missing from the Colour page
- **CHECK** `tests/brand-tokens.test.mjs` › "the Colour page groups every light colour token"
