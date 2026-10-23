# Let the slot decide a row's shape

## Status

Accepted, 0.14.0.

## Context

On 2026-10-23 Paykit's owner sent five phone screenshots of screens that
looked broken without being wrong. Three of them were the same defect in
three places:

- **G1.** A draft quote's actions — Send quote, Approve & convert, and the
  menu — wrapped into two ragged rows with the menu trigger alone on the
  second. `.kairos-action-row` and `.kairos-page-header-actions` were
  `flex-wrap: wrap` with no narrow rule, and below 768px a page header's
  actions were a one-column grid that put every action, the trigger included,
  on a full-width row of its own.
- **G5.** A bank statement import's four steps broke their labels one letter
  per line. `.kairos-wizard-step` was a shrinking flex item, so the rail
  squeezed every step to fit instead of scrolling.
- **G6.** A dialog's close glyph dropped onto a line of its own under a
  two-line title. `Dialog` put the title and the close in `kairos-split`,
  which is a flex row that wraps.

In each, the row was a wrapping flex container, and what happened at a narrow
width was decided by the labels in it: how long they were, how many there
were, which happened to fit. The same row looked different on every screen
that used it, and on a phone some of those looked broken.

The branding skill already says a slot's geometry comes from the slot and not
from its content (Sizing And Layout Stability), and the field's reserved
message row (ADR 0001) and the button's one box (ADR 0002) are that rule
applied to single controls. These rows were the place it had not reached.

## Decision

A row that holds controls has a shape at narrow widths, and the shape is a
grid that the stylesheet declares, not a flex row that its content wraps.

- **Action rows and page header actions** (below 640px and 768px
  respectively): one column for actions and a narrow `auto` column for the
  menu trigger. The primary is ordered first and takes the whole of its row;
  every other action takes the first column; the trigger takes the end column
  of the first row that has one free (`grid-auto-flow: dense`). Primary and
  menu alone share one row. The old one-column `!important` grid is removed.
- **Dialog head**: `kairos-dialog-head`, `minmax(0, 1fr) auto`. The title
  wraps inside its column and the close holds the top-right corner.
- **Steps**: `kairos-steps` is one row that never wraps; below the width a
  count's names need, the steps not current drop to their numbers. The wizard
  rail keeps its labels on one line and scrolls.

The same release removes the thing that made the action rows long in the first
place: a page header's secondary folds into its menu below 900px (`ActionSet`
renders it twice and the stylesheet shows one), so a phone header is a primary
and a menu.

## Consequences

- An action row on a phone is a column of full-width buttons under the
  primary. That is taller than a wrapped flex row for a row of three short
  buttons, and it is one shape on every screen. A row that should stay inline
  at every width is not an action row — `kairos-inline-actions` is.
- The narrow rules identify the primary by class (`kairos-button--primary`,
  `kairos-page-header-primary`, or a wrapper holding one). A primary written
  some other way is ordered where the markup put it.
- The rules use `:has()` and `:nth-child(… of …)`. A browser without them
  falls back to the one-column grid, which stacks and does not overlap. A test
  fails any `:has()` nested in another, which is invalid and would drop the
  rule silently.
- `tests/geometry.test.mjs` pins each rule, and the Density stories assert the
  shapes in a browser at the story runner's width.
