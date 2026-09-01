# Reserve one message row in a field

## Context

`Field` renders a hint row and an error row whether or not either carries
content, so validating a form does not move the controls below it. That
guarantee is right and is not in question here.

Reserving both rows costs 40px of the field's 107px. A field with no hint and
no error, which is most fields on most forms, spends 34px on nothing. The pitch
between two text inputs in a `kairos-form-stack` is 123px.

Holding both rows also puts an error in the wrong place. The error renders
after the hint, so on a field with no hint the error sits 39px below its own
input and 35px above the next field's label. It is nearer the control it does
not describe than the one it does, which is a misread rather than a cosmetic
problem.

Form spacing is also the only spacing role in the system with no role token.
`.kairos-form-stack` and `.kairos-field` write `var(--kairos-space-lg)` and
`var(--kairos-space-xs)` directly, so tuning the one thing people ask about is
not a one-line edit the way `--kairos-panel-pad` is.

## Decision

A field reserves one message row, not two. The hint holds the slot; an error
replaces the hint when it fires. Layout still never moves, because the slot is
the same height either way, and the error lands directly under its control.

The field drops from 107px to 83px and a two-field panel from 312px to 266px.
Both figures are measured, not estimated.

Where a field genuinely needs the hint to stay visible while an error shows,
the call site passes the hint text into the error string. Two stacked message
rows are not available, because the layout cost falls on every field in the app
to serve the rare one.

`--kairos-field-gap` and `--kairos-form-gap` join the role tokens, so the next
adjustment to form density is one edit rather than two literals in two rules.
The stack gap stays at `--kairos-space-lg`: the gap was never the problem, and
16px between fields reads correctly once the fields stop being 107px tall.
