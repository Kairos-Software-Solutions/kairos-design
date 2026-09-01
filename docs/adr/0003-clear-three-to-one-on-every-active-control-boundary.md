# Clear 3:1 on every active control boundary

## Context

`--kairos-border-subtle` measures 1.73:1 against the page, 1.82:1 against a
surface, and 1.49:1 against an elevated ground in the light theme. Dark clears
3:1 against the page only, at 3.04:1.

It is the entire visual boundary of `.kairos-overflow-trigger`, which is a
button, and it draws the dividers separating the options of
`.kairos-segmented-option`. Neither is decoration and neither is disabled, so
neither is exempt from WCAG 2.2 SC 1.4.11.

The same token also draws table row separators, the record card boundary, and
the disabled input border. Row separators inside a bordered container are
decoration. A disabled control is explicitly exempt. Those uses are fine and
changing the token for them alone would be churn.

Axe reports nothing here. Axe tests text contrast and does not test non-text
contrast on borders, so a green axe run says nothing about this class of
failure. Every contrast figure in this repo was computed by hand for that
reason, and the ones in `tokens.css` comments are correct.

The system's own focus ring was built to clear 1.4.11 and does. This is the
resting state that the same care did not reach.

## Decision

`--kairos-border-subtle` moves to a value clearing 3:1 against
`--kairos-elevated`, which is the tightest ground it sits on, in both themes.
Every other use of the token inherits the lift, which is acceptable: a row
separator reading slightly stronger is a smaller cost than a control with no
findable edge.

A test computes the ratio from `tokens.css` and fails below 3:1, so the figure
cannot drift back. Contrast joins spacing, type and raw hex as a property the
build enforces rather than a property a comment claims. The comments were
already right; nothing was checking them.

The disabled input keeps `--kairos-border-subtle` and moves with it. Its two
signals stay the ground dropping to the page and the border dropping to the
subtle weight, which is the treatment ADR 0004 also gives the disabled button.
