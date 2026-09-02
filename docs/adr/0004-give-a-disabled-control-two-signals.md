# Give a disabled control two signals

## Context

`.kairos-input-field:disabled` drops its ground to the page so the field stops
looking raised off it, and drops its border to the subtle weight so it stops
claiming the structural rank. Opacity is deliberately not used, because dimming
an input dims the value inside it, and the value is often why the field is on
the screen.

The comment on that rule says it uses "deliberately the same two signals" as
`.kairos-button:disabled`, so that "not available" reads the same on a control
that takes input as on one that commits.

`.kairos-button:disabled` sets `cursor: not-allowed`, `opacity: 0.7`,
`box-shadow: none` and `transform: none`. It has one signal, not two, and the
comment describes a rule that does not exist.

On the borderless ranks the single signal is close to nothing. In the Button
Matrix, a disabled `ghost` and an enabled `ghost` are the same control with
slightly lighter text, on text that was already muted.

The branding skill adds a constraint the flat opacity breaks: a disabled primary
must stay visibly distinct from an enabled secondary. A uniform `opacity: 0.7`
across every rank inverts them, leaving a washed-out amber primary beside a
solid-bordered secondary that reads as the more prominent of the two, at the
moment the user is looking for the way forward.

## Decision

A disabled button takes the treatment the input already has. The ground drops
toward the page and the border drops to `--kairos-border-subtle`, and the stamp
and the transform stay off.

The primary rank keeps its amber at reduced saturation rather than dropping to
the page, so rank 1 disabled still outranks rank 2 enabled. That is the one
place the two controls differ, and it differs because the skill says it must.

Opacity stops being the mechanism on every rank. It is available as an
enhancement on the label alone where a rank needs more separation, never on the
whole control.

The Button Matrix story renders every rank enabled and disabled adjacently, so
a rank whose two states look alike is visible in the workshop.
