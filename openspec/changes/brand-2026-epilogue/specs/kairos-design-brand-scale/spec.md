## MODIFIED Requirements

### Requirement: The Brand Scale is opt-in at the root
The package SHALL ship `kairos-design/brand.css`. Its rules SHALL apply only when the root element carries `data-scale="brand"`; importing the file without the attribute SHALL change nothing.

#### Scenario: Imported, not switched on
- **WHEN** `dist/brand.css` is parsed
- **THEN** it holds exactly one style rule, whose selector is `:root[data-scale='brand']`, and no at-rule other than comments
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css applies only under data-scale=brand on the root"

#### Scenario: Switched on in the workshop
- **WHEN** a Brand story renders with `data-scale="brand"` on `<html>`
- **THEN** its primary button has a 3px radius and a 50px height
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes

#### Scenario: Switched off again
- **WHEN** a story without the `scale` parameter renders after the Brand stories, with `brand.css` still imported
- **THEN** `<html>` has no `data-scale` attribute and a primary button reports the Product Scale box: radius 0px, height 36px, the 4px ink stamp at rest, and the sentence-case label 0.17.0 gave the apps (`text-transform: none`)
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Without The Switch" passes

### Requirement: brand.css carries the brief's geometry, type and motion
At Brand Scale the tokens SHALL take the values of Kairos design brief v3 (lock revision 3): 3px button and field radius, 2px panel radius, 50px buttons (44px small) with 26px (18px) side padding, 16px/700 sentence-case button labels, 52px fields (120px textarea) with 18px/500 text, the 3px focus ring at 3px offset, soft card shadows, and the brief's type ranks, curve and durations, all at the family's normal width.

#### Scenario: Values table
- **WHEN** each token `brand.css` sets is resolved under the Brand Scale
- **THEN** it equals the value in `design.md` › Brand Scale (for example `--kairos-radius-button` 3px, `--kairos-control-h` 50px, `--kairos-type-display-size` `clamp(31px, 3.8vw, 50px)`, `--kairos-type-title-size` `clamp(35px, 4.6vw, 63px)`, `--kairos-type-h2-size` `clamp(26px, 2.7vw, 37px)`, `--kairos-duration` 260ms, `--kairos-ease` `cubic-bezier(0.2, 0.75, 0.25, 1)`), and `brand.css` sets no token outside that table
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css carries the brief's geometry, type and motion"

#### Scenario: Reduced motion still wins
- **WHEN** `brand.css` and the reduced-motion block of `kairos.css` are read
- **THEN** `brand.css` does not set `--kairos-duration-none`, which stays 1ms, and the reduced-motion block still covers every `kairos-` element
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css leaves reduced motion at 1ms"

### Requirement: Type ranks follow the scale
The type-rank classes SHALL resolve to the sizes, weights, line heights and tracking of lock revision 3 at Brand Scale, at the family's normal width, and to existing Product Scale steps without it, so no new number reaches an app that does not opt in.

#### Scenario: Ranks at Brand Scale
- **WHEN** the Brand "Type Ranks" story renders every `kairos-type-*` rank
- **THEN** the display rank uses Epilogue at weight 800 with a computed `font-stretch` of 100%, the body rank is 17px at line height 1.6, the label and price ranks use Courier Prime at weight 700, and no rank reports a `font-stretch` other than 100%
- **CHECK** `npm run test-stories`: `stories/brand/Foundations.stories.tsx` › "Type Ranks" passes

#### Scenario: Ranks at Product Scale
- **WHEN** each `--kairos-type-*-size` default in `tokens.css` is resolved
- **THEN** it equals a value the 0.14 type scale already holds (a `--kairos-text-*` step or the 24px title)
- **CHECK** `tests/brand-scale.test.mjs` › "every type rank has a Product Scale size from the 0.14 type scale"

## ADDED Requirements

### Requirement: The brand layer sets no width
`tokens.css` and `brand.css` SHALL declare no token whose name ends in `-stretch`, and `kairos.css` SHALL set `font-stretch` only in rules beginning `:root:not([data-scale='brand'])` (0.17.0's apps type block), so every brand surface renders at its family's normal width, as lock revision 3 requires.

#### Scenario: No width token
- **WHEN** the declarations of `dist/tokens.css` and `dist/brand.css` are read, and `brand.css` is searched with comments stripped
- **THEN** no property name ends in `-stretch`, and `brand.css` holds no `stretch`
- **CHECK** `tests/brand-scale.test.mjs` › "no width token is declared"

#### Scenario: No width rule in the brand layer
- **WHEN** every `font-stretch` declaration in `dist/kairos.css` is read
- **THEN** each one's selector begins with `:root:not([data-scale='brand'])`
- **CHECK** `tests/brand-scale.test.mjs` › "kairos.css sets font-stretch only in the apps' type block"

### Requirement: Ranks for form titles, card headings and times
`kairos.css` SHALL add `kairos-type-title--compact` (the form page title), `kairos-type-card` with `kairos-type-card--sm` (card headings) and `kairos-type-time` (a typed time line), each reading `--kairos-type-*` tokens whose Product Scale default is a 0.14 step and whose Brand values follow the lock revision 3 type table. Each SHALL be documented in the manifest.

#### Scenario: Compact title
- **WHEN** `brand.css` is resolved and the type rules of `kairos.css` are read
- **THEN** `--kairos-type-title-compact-size` is `clamp(35px, 3.8vw, 52px)` at Brand Scale, and `.kairos-type-title--compact` sets `font-size` from it in a rule after `.kairos-type-title`
- **CHECK** `tests/brand-parts.test.mjs` › "the compact title, card and time ranks read their tokens"

#### Scenario: Card heading and time line
- **WHEN** the Brand "Type Ranks" story renders a `kairos-type-card`, a `kairos-type-card kairos-type-card--sm` and a `kairos-type-time`
- **THEN** the card heading is Epilogue 20px at weight 800, line height 1.15, with no case transform; the small one is 19px; the time line is Courier Prime 16px at weight 400, line height 1.6
- **CHECK** `npm run test-stories`: `stories/brand/Foundations.stories.tsx` › "Type Ranks" passes

#### Scenario: Documented
- **WHEN** the manifest `docs/kairos-ui.md` is compared with the classes `kairos.css` defines
- **THEN** `kairos-type-title--compact`, `kairos-type-card`, `kairos-type-card--sm` and `kairos-type-time` each have a row or belong to the documented type-rank block
- **CHECK** `tests/contract.test.mjs` › "every class has a manifest row, or a documented block"
