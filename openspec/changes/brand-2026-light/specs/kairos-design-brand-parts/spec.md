# Spec Delta: kairos-design-brand-parts

## Purpose

Ship the parts the Kairos brief's Component vocabulary marks shared as kairos-design classes that read tokens only, give Field the brief's required mark, and keep the parts the brief marks site-only out of the package.

## ADDED Requirements

### Requirement: Every shared part has a class
`kairos.css` SHALL define a class block for every part Kairos design brief v1 marks shared and the package does not already have: text link, menu link, language link, required mark, error line, tick box, day grid, time-of-day switch, soft card, inset band, section band, tint card, tick list, step line, site header, phone menu, site footer, placeholder text, photo slot, marker, title bar, type ranks and content wrapper. Each SHALL have a manifest row.

#### Scenario: Vocabulary present
- **WHEN** the classes `kairos.css` defines are read
- **THEN** each block named in `design.md` › Shared parts is defined (`kairos-text-link`, `kairos-menu-link`, `kairos-lang-link`, `kairos-required`, `kairos-error-line`, `kairos-tick-box`, `kairos-day-grid`, `kairos-time-switch`, `kairos-card--soft`, `kairos-inset-band`, `kairos-section-band`, `kairos-tint-card`, `kairos-tick-list`, `kairos-step-line`, `kairos-site-header`, `kairos-site-menu`, `kairos-site-footer`, `kairos-placeholder`, `kairos-photo-slot`, `kairos-marker`, `kairos-title-bar`, `kairos-type-display` and the other ranks, `kairos-wrap`)
- **CHECK** `tests/brand-parts.test.mjs` › "every shared part from the brief has its class"

#### Scenario: Documented
- **WHEN** the manifest `docs/kairos-ui.md` is compared with the classes `kairos.css` defines
- **THEN** every new class has a row or belongs to a documented block
- **CHECK** `tests/contract.test.mjs` › "every class has a manifest row, or a documented block"

### Requirement: Parts read tokens only
The new parts SHALL take every colour, spacing, radius, border weight, font size, shadow, duration and easing from tokens, as every existing class does.

#### Scenario: Existing guardrails cover the new parts
- **WHEN** `npm test` runs after the change
- **THEN** the existing guardrails pass with the new rules in place
- **CHECK** `tests/contract.test.mjs` › "no raw hex outside the token layer"; `tests/scale.test.mjs` › "every spacing value is a step on the scale", "tracking, radius, and border weight come from tokens", "every font size is a step on the type scale", "every shadow comes from the stamp tokens", "no literal duration or easing", "every token is read by something"

### Requirement: Links follow the brief
The text link SHALL be ink, weight 700, with a 3px highlight underline at a 5px offset and a tap target at least 44px tall; on hover its underline SHALL turn ink and its arrow nudge. The menu link SHALL be at least 44px tall, sweep a highlight marker in on hover, and mark the current page with a 3px highlight underline when it carries `aria-current="page"`. The language link SHALL show its 1px × 18px ink-3 separator on the menu and a 48px row variant.

#### Scenario: Links at rest
- **WHEN** the Brand "Links" story renders a text link, two menu links (one with `aria-current="page"`) and a language link in both variants
- **THEN** the text link reports colour ink, weight 700, a 3px underline in highlight at 5px offset and a height of at least 44px; the menu links are at least 44px tall and only the current one shows the 3px underline; the menu language link's separator (`getComputedStyle(el, '::before')`) is 1px wide and 18px tall with an ink-3 ground; the row variant is 48px tall
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Links" passes

#### Scenario: Link and menu hover
- **WHEN** a reviewer hovers the Brand text link, the menu links and a footer link at 1366, and taps them at 390
- **THEN** the text link's underline turns ink and its arrow moves right, the menu link's highlight marker sweeps in behind the word from the left, the footer link gains its underline, and each change runs on the scale's duration and curve tokens, matching the brief's state shots
- **CHECK** planner browser check on the built workshop at 1366 and 390 against the brief's `state-nav-hover-1366.png` (Workflow follow-up)

### Requirement: Choice controls follow the brief
The tick box, day grid and time-of-day switch SHALL be built on native checkbox and radio inputs, so keyboard picking is the browser's. A checked tick box SHALL fill with tint; a picked day SHALL fill with picked and show its 2px ink frame; the time switch pill SHALL be hidden until the first pick and then sit on the checked option; an invalid group SHALL draw its edge in the error colour.

#### Scenario: Ticking and picking
- **WHEN** the Brand "Choices" story's play function clicks a tick box, a day and then another day, and a time option
- **THEN** the ticked box's ground is tint, only the last day picked reads as picked (picked ground and a visible frame), the day grid shows 5 columns of 62px cells, and the pill is hidden before the first time pick and visible over the checked option after it
- **CHECK** `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Choices" passes

#### Scenario: A pill position for every option count
- **WHEN** the time switch rules in `kairos.css` are read
- **THEN** there is a pill position for each option from the first to the fifth, so a switch of 2 to 5 options puts the pill on whichever is checked
- **CHECK** `tests/brand-parts.test.mjs` › "a time switch pill has a position for every option count it allows"

#### Scenario: Invalid groups
- **WHEN** the Brand "Errors" story renders a day grid and a time switch with `aria-invalid="true"`
- **THEN** the day grid's outer edge and the time switch track are drawn in the error colour
- **CHECK** `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Errors" passes

#### Scenario: Keyboard
- **WHEN** a reviewer tabs into the day grid and the time switch and uses the arrow keys and Space
- **THEN** arrows move between options, Space picks, and the focus ring is visible (inset on day cells)
- **CHECK** planner browser check on the built workshop at 1366 and 390 (Workflow follow-up)

### Requirement: The error line and the required mark follow the brief
The error line SHALL show a 20px round badge in the error colour holding "!" in on-error, then its text in the error colour, and shake once when it appears unless reduced motion is set. `Field` SHALL render the required mark inside the label when its control is required, hidden from assistive technology, while the control keeps its own `required` attribute.

#### Scenario: Error line
- **WHEN** the Brand "Errors" story renders a standalone `kairos-error-line`
- **THEN** its badge is 20px wide and tall, fully round, filled with the error colour, holding "!", and its text is in the error colour
- **CHECK** `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Errors" passes

#### Scenario: Error line shakes once
- **WHEN** the `kairos-error-line` rules in `kairos.css` and the Brand-scoped Field error rule are read
- **THEN** each runs an animation whose `@keyframes` is defined in `kairos.css`, for `var(--kairos-duration-shake)` (320ms in `tokens.css`), with an iteration count of 1, on an element carrying a `kairos-` class
- **CHECK** `tests/brand-parts.test.mjs` › "the error line shakes once on a duration token"; planner browser check of the shake at 1366 (Workflow follow-up)

#### Scenario: Reduced motion stills the error line
- **WHEN** the reduced-motion block of `kairos.css` is matched against the error line, its badge and the Field error
- **THEN** its selectors cover each of them (and their `::before`), so the shake runs once for `--kairos-duration-none` (1ms), and `brand.css` does not change that token
- **CHECK** `tests/brand-parts.test.mjs` › "reduced motion stills the error line"; planner browser check with `prefers-reduced-motion: reduce` emulated (Workflow follow-up)

#### Scenario: Required mark in Field
- **WHEN** `dist/react/Field.tsx` is read
- **THEN** `Field` accepts `required`, renders `<span className="kairos-required" aria-hidden="true">` inside the label only when it is set, and `InputField`, `Textarea` and `SelectField` pass their `required` prop to both `Field` and the control
- **CHECK** `tests/brand-parts.test.mjs` › "the required mark is hidden from assistive technology"; `npm run typecheck` exits 0

### Requirement: Surfaces, lists and marks follow the brief
The soft card, inset band, section band and tint cards SHALL paint the brief's grounds and shadows. The tick list SHALL draw 28px boxes with a 2px tick-green edge; the step line SHALL fill box 1 with highlight and edge the rest in tick green. Placeholder text SHALL be the placeholder colour at weight 600; the marker SHALL be a highlight bar behind its phrase.

#### Scenario: Cards and bands
- **WHEN** the Brand "Cards And Bands" story renders each surface
- **THEN** the soft card has the card ground and no border, the inset band the tint ground, the section band the band ground, and the tint card's band variant the band ground
- **CHECK** `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Cards And Bands" passes

#### Scenario: Tick list and step line
- **WHEN** the Brand "Lists" story renders a tick list and a four-step step line
- **THEN** each tick box is 28px with a 2px edge in tick green, step box 1 has the highlight ground, and boxes 2 to 4 have the card ground with a tick-green edge
- **CHECK** `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Lists" passes

#### Scenario: Placeholder and marker
- **WHEN** the Brand "Placeholders And Marker" story renders placeholder text, a photo slot and a marked phrase
- **THEN** the placeholder text is in the placeholder colour at weight 600, the photo slot has the photo shadow, and the marker's bar uses the highlight colour
- **CHECK** `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Placeholders And Marker" passes

### Requirement: Site shells follow the brief
The site header SHALL be a sticky card-ground bar at the header height token with a hairline under it; the footer SHALL have the card ground with a top rule; the phone menu's toggle SHALL turn its two bars into a cross when `aria-expanded="true"`. Opening, closing, focus moves and the header button's collapse stay site code.

#### Scenario: Header and footer
- **WHEN** the Brand "Header And Footer" story renders a site header and footer
- **THEN** the header is `position: sticky` with the card ground and a height equal to the resolved `--kairos-site-header-h`, and the footer has the card ground and a 1px top edge in the rule colour
- **CHECK** `npm run test-stories`: `stories/brand/Shell.stories.tsx` › "Header And Footer" passes

#### Scenario: Phone menu toggle
- **WHEN** the Brand "Phone Menu" story's play function sets the toggle's `aria-expanded` to true
- **THEN** the two bars carry a rotation and the menu body is shown with the card ground
- **CHECK** `npm run test-stories`: `stories/brand/Shell.stories.tsx` › "Phone Menu" passes

### Requirement: Site-only parts stay out of the package
The package SHALL NOT ship the logo reel or its spotlight panel, the reel's no-pause rule, form topics, review days, the verse card or founder photo tilts, review-line wording or the WhatsApp message.

#### Scenario: Nothing site-only ships
- **WHEN** `dist/` (stylesheets and React modules) is searched
- **THEN** no class or identifier names a reel, spotlight, logo tile, verse, founder or form topic, and no stylesheet or module holds the words "WhatsApp" or "business review"
- **CHECK** `tests/brand-parts.test.mjs` › "no site-only part ships"

### Requirement: The workshop shows the brand as the brief draws it
The workshop's Brand stories SHALL match the brief's reference pages and state shots for every shared part at 1366 and 390, apart from the site content and the site-only parts.

#### Scenario: Workshop against the brief
- **WHEN** a reviewer opens the Brand stories in the built workshop at 1366 and 390 next to the brief's reference pages and shots
- **THEN** buttons, links, fields, choices, error lines, cards, bands, lists, shells, placeholders and the marker match in colour, size, weight, radius, shadow and state, and the computed styles of matching elements agree
- **CHECK** planner browser check and computed-style compare on the built workshop (Workflow follow-up)
