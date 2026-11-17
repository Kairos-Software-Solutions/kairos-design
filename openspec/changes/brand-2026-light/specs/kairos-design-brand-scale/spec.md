# Spec Delta: kairos-design-brand-scale

## Purpose

Give websites and other brand surfaces the Kairos brief's geometry, type and motion through one opt-in stylesheet and one root attribute, while apps that do not opt in keep their Product Scale shape exactly.

## ADDED Requirements

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
- **THEN** `<html>` has no `data-scale` attribute and a primary button reports the Product Scale box: radius 0px, height 36px, the 4px ink stamp at rest, an uppercase label
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Without The Switch" passes

### Requirement: brand.css holds tokens only, and no colour
`brand.css` SHALL declare only custom properties. It SHALL hold no colour value (colours come from `tokens.css` through `var()`), no class rule, no `@font-face` and no `url()`, and every token it sets SHALL have a Product Scale default in `tokens.css`.

#### Scenario: Only custom properties
- **WHEN** every declaration in `brand.css` is read
- **THEN** each property name starts with `--kairos-`
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css declares only custom properties"

#### Scenario: No colour value
- **WHEN** `brand.css` is read with comments stripped
- **THEN** it contains no hex colour, no `rgb(`, `rgba(`, `hsl(`, `oklch(` or `color-mix(`, and no `@font-face` or `url(`
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css holds no colour value"

#### Scenario: Every override has a default
- **WHEN** the tokens `brand.css` sets are compared with those `tokens.css` declares
- **THEN** every one is declared in `tokens.css`, and every token `brand.css` reads is declared somewhere in `tokens.css` or `brand.css`
- **CHECK** `tests/brand-scale.test.mjs` › "every token brand.css sets has a Product Scale default in tokens.css", and `tests/contract.test.mjs` › "no custom property is referenced without a definition or a fallback" with `brand.css` added to its sources

### Requirement: brand.css carries the brief's geometry, type and motion
At Brand Scale the tokens SHALL take the values of Kairos design brief v1: 3px button and field radius, 2px panel radius, 50px buttons (44px small) with 26px (18px) side padding, 16px/700/108% sentence-case button labels, 52px fields (120px textarea) with 18px/500 text, the 3px focus ring at 3px offset, soft card shadows, and the brief's type ranks, curve and durations.

#### Scenario: Values table
- **WHEN** each token `brand.css` sets is resolved under the Brand Scale
- **THEN** it equals the value in `design.md` › Brand Scale (for example `--kairos-radius-button` 3px, `--kairos-control-h` 50px, `--kairos-type-display-size` `clamp(38px, 4.4vw, 62px)`, `--kairos-duration` 260ms, `--kairos-ease` `cubic-bezier(0.2, 0.75, 0.25, 1)`)
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css carries the brief's geometry, type and motion"

#### Scenario: Reduced motion still wins
- **WHEN** `brand.css` and the reduced-motion block of `kairos.css` are read
- **THEN** `brand.css` does not set `--kairos-duration-none`, which stays 1ms, and the reduced-motion block still covers every `kairos-` element
- **CHECK** `tests/brand-scale.test.mjs` › "brand.css leaves reduced motion at 1ms"

### Requirement: Buttons follow the brief at Brand Scale
At Brand Scale the primary and secondary ranks SHALL render as the brief's main and outline buttons: same box for both, no shadow at rest, the hard ink offset only on hover with the 2px lift, none on press, and the existing busy behaviour.

#### Scenario: Main and outline at rest
- **WHEN** the Brand "Buttons" story renders a primary and a secondary button at default and small size
- **THEN** both report a 3px radius, 50px height (44px small), 26px side padding (18px small), a 16px 700-weight label with no case transform, no box shadow, a 2px edge in ink, highlight fill on the primary and card fill on the secondary, transitions of 160ms, and equal widths for equal labels
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes (its play function asserts these computed values)

#### Scenario: A busy button keeps its box
- **WHEN** the same story renders a primary button with `loading` true beside one with `loading` false and the same label
- **THEN** both have the same width, the busy one carries `aria-busy="true"`, and a click on it does not call its handler
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes

#### Scenario: Hover, press and focus at Brand Scale
- **WHEN** a reviewer hovers, presses and tabs to the Brand buttons, links and fields at 1366 and 390
- **THEN** hover lifts the button onto the 4px ink offset with the strong highlight (outline: tint fill), press drops it to no shadow at `scale(0.98)`, focus shows a 3px ink ring at 3px offset, and a focused field fills with tint, matching the brief's state shots
- **CHECK** planner browser check on the built workshop at 1366 and 390 against the brief's `state-button-hover-1366.png` and `state-outline-hover-1366.png` (Workflow follow-up)

### Requirement: Fields follow the brief at Brand Scale
At Brand Scale a field SHALL render the brief's text field: 52px (textarea 120px), 10px × 14px padding, 2px ink-3 border, 3px radius, 18px/500 text, 160ms transitions, a 15px/700 sentence-case ink label, a 15px ink-3 hint, a red asterisk on a required field, and the error line with its badge under an invalid field, in a message slot tall enough that an error moves nothing below the field.

#### Scenario: Field at rest
- **WHEN** the Brand "Fields" story renders an `InputField`, a `Textarea` and a `SelectField`
- **THEN** the input reports min-height 52px, the textarea 120px, padding 10px top and bottom and 14px left and right, a 2px border in ink-3, a 3px radius, 18px text at weight 500 and border and background transitions of 160ms; the label is 15px, weight 700, no case transform, in ink; and a hint under the control is 15px in ink-3
- **CHECK** `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Fields" passes

#### Scenario: Required field
- **WHEN** the story renders an `InputField` with `required`
- **THEN** the label shows an asterisk in the error colour, the asterisk is `aria-hidden="true"`, and the input carries `required`
- **CHECK** `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Fields" passes

#### Scenario: Invalid field
- **WHEN** the Brand "Errors" story renders an `InputField` with an error
- **THEN** the input carries `aria-invalid="true"` and an error-coloured border, the error message shows a 20px round badge holding "!" before 15px text at weight 600 in the error colour, and its `.kairos-field` box is as tall (`getBoundingClientRect().height`) as that of the same field rendered beside it without an error
- **CHECK** `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Errors" passes

### Requirement: Type ranks follow the scale
The type-rank classes SHALL resolve to the brief's sizes, weights, widths, line heights and tracking at Brand Scale, and to existing Product Scale steps without it, so no new number reaches an app that does not opt in.

#### Scenario: Ranks at Brand Scale
- **WHEN** the Brand "Type Ranks" story renders every `kairos-type-*` rank
- **THEN** the display rank uses Archivo at weight 800 and 118% width, the body rank is 17px at line height 1.6, and the label and price ranks use Courier Prime at weight 700
- **CHECK** `npm run test-stories`: `stories/brand/Foundations.stories.tsx` › "Type Ranks" passes

#### Scenario: Ranks at Product Scale
- **WHEN** each `--kairos-type-*-size` default in `tokens.css` is resolved
- **THEN** it equals a value the 0.14 type scale already holds (a `--kairos-text-*` step or the 24px title)
- **CHECK** `tests/brand-scale.test.mjs` › "every type rank has a Product Scale size from the 0.14 type scale"

### Requirement: Surfaces follow the brief at Brand Scale
At Brand Scale the stamp tokens SHALL resolve to the brief's soft card shadow, the pressed stamp to no shadow, and panels to the 2px radius.

#### Scenario: Soft shadows replace the stamp
- **WHEN** the Brand "Cards And Bands" story renders a `kairos-card--soft` and a `kairos-panel`
- **THEN** both shadows are the soft card shadow (`0px 14px 30px -20px` in the soft shadow colour) and the panel radius is 2px
- **CHECK** `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Cards And Bands" passes
