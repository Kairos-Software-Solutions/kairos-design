## ADDED Requirements

### Requirement: Labels and footer headings keep the brief's case
The label, price and time ranks and the site footer heading SHALL set `text-transform: none`, and the footer heading SHALL take the label rank's line height and tracking, so on an `h1`-`h6` element at the Brand Scale they do not inherit the base heading rule's capitals, display tracking and line height of 1.

#### Scenario: Label and footer rules
- **WHEN** the `kairos.css` rules for `.kairos-type-label`, `.kairos-type-price`, `.kairos-type-time` and `.kairos-site-footer-heading` are read
- **THEN** each sets `text-transform: none`, and the footer heading also sets `line-height: var(--kairos-type-label-leading)` and `letter-spacing: var(--kairos-type-label-tracking)`
- **CHECK** `tests/brand-parts.test.mjs` › "label ranks and the footer heading undo the heading capitals"

#### Scenario: On a heading in the workshop
- **WHEN** the Brand "Header And Footer" story renders its footer headings as `h2.kairos-site-footer-heading`, and the Brand "Type Ranks" story renders an `h3.kairos-type-label`
- **THEN** both report `text-transform: none`, and the footer heading's line height is 24px (15px at 1.6)
- **CHECK** `npm run test-stories`: `stories/brand/Shell.stories.tsx` › "Header And Footer" and `stories/brand/Foundations.stories.tsx` › "Type Ranks" pass

### Requirement: The title bar and the marker tilt with rotate
`.kairos-title-bar::after` and `.kairos-marker::after` SHALL tilt by `--kairos-marker-tilt` (-1deg) through the `rotate` property and SHALL set no `transform`, so a host that wipes them in with `transform: scaleX()` keeps the tilt.

#### Scenario: Tilt rules
- **WHEN** the `kairos.css` rules for `.kairos-title-bar::after` and `.kairos-marker::after` are read
- **THEN** each declares `rotate: var(--kairos-marker-tilt)` and neither declares `transform`
- **CHECK** `tests/brand-parts.test.mjs` › "the title bar and the marker tilt with rotate, not transform"

#### Scenario: Tilt in the workshop
- **WHEN** the Brand "Placeholders And Marker" story renders a marked phrase and a heading with `kairos-title-bar`
- **THEN** `getComputedStyle(el, '::after').rotate` is `-1deg` for both, and both report `transform: none`
- **CHECK** `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Placeholders And Marker" passes

### Requirement: Tick list values sit a step under the statement rank
`.kairos-tick-list-value` SHALL read `--kairos-tick-list-value-size`, `--kairos-tick-list-value-phone-size` (at 520px and under) and `--kairos-tick-list-value-leading`, which default to the statement rank and at Brand Scale are `clamp(19px, 1.6vw, 21px)`, 18px and 1.35. A value in `kairos-tick-list--statement` SHALL keep the statement rank.

#### Scenario: Values read their own knobs
- **WHEN** the `kairos.css` rules for `.kairos-tick-list-value` are read, the `@media (max-width: 520px)` one included, and the three knobs are resolved at both scales
- **THEN** font size, phone font size and line height read the three knobs; at the Product Scale each resolves to the statement rank's value, and at Brand Scale to `clamp(19px, 1.6vw, 21px)`, 18px and 1.35
- **CHECK** `tests/brand-parts.test.mjs` › "tick list values read their own size knobs"

#### Scenario: The statement list keeps its rank
- **WHEN** the rule for `.kairos-tick-list--statement .kairos-tick-list-value` is read
- **THEN** it sets `font-size: var(--kairos-type-statement-size)` and `line-height: var(--kairos-type-statement-leading)`, and comes after the phone rule, so it wins at every width
- **CHECK** `tests/brand-parts.test.mjs` › "the statement tick list keeps the statement rank"

### Requirement: A text link underlines its words, not the arrow alone
The text link's documented markup SHALL put the label and its trailing `kairos-text-link-arrow` inside one `kairos-text-link-text` span, which `kairos.css` SHALL define as `display: inline`, so the underline runs under the words, the arrow is no flex item of its own, and its hover nudge still works.

#### Scenario: Text link documented
- **WHEN** the `kairos-text-link` row of `docs/kairos-ui.md` and the rules of `kairos.css` are read
- **THEN** the row says the label and the arrow go inside one `kairos-text-link-text` span, and `.kairos-text-link-text` sets `display: inline`
- **CHECK** `tests/brand-parts.test.mjs` › "the text link wraps its label and arrow in one span"

#### Scenario: Wrapped in the workshop
- **WHEN** the Brand "Links" story renders `<a class="kairos-text-link"><span class="kairos-text-link-text">… <span class="kairos-text-link-arrow">→</span></span></a>`
- **THEN** the wrapper reports `display: inline`, the arrow `inline-block`, and the anchor has exactly one element child
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Links" passes; planner browser check at 1366 and 390 that one underline runs under the words and the arrow (Workflow follow-up)

### Requirement: The phone menu follows lock revision 3 and marks the current page
Phone menu rows SHALL be 23px at weight 800 (`--kairos-site-menu-row-size`), and a `kairos-site-menu-row` with `aria-current="page"` SHALL be underlined in its own ink at the current-page offset (`--kairos-menu-link-current-offset`, 6px).

#### Scenario: Phone menu rules
- **WHEN** `--kairos-site-menu-row-size` is resolved and the `.kairos-site-menu-row[aria-current='page']` rule is read
- **THEN** the size is 23px, and the rule sets `text-decoration-line: underline` and `text-underline-offset: var(--kairos-menu-link-current-offset)` and no decoration colour
- **CHECK** `tests/brand-parts.test.mjs` › "phone menu rows are 23px and the current one is underlined"

#### Scenario: Phone menu in the workshop
- **WHEN** the Brand "Phone Menu" story renders rows, one with `aria-current="page"`
- **THEN** every row reports a 23px font size; the current row reports `text-decoration-line: underline`, a 6px underline offset and a decoration colour equal to its text colour; the other rows report no underline
- **CHECK** `npm run test-stories`: `stories/brand/Shell.stories.tsx` › "Phone Menu" passes
