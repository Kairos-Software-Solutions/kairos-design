# Give decorative hairlines their own token

## Status

Accepted, 0.15.0.

## Context

Kairos design brief v1 draws its rows, the header and footer edges, the legal
rule and the day grid's inner lines in an 18% ink hairline, and a photo's edge
in a 20% one. It calls the 20% line `border`.

`--kairos-border` already exists and means something else: the solid ink edge
of a panel, a field or a button, read by about fifty rules. ADR 0003 holds every
active control boundary at 3:1 or more against its ground, and a 20% hairline
measures well under that. Re-pointing `--kairos-border` to the brief's value
would have drawn every control in every app in a line too faint to find.

## Decision

The hairlines are new tokens: `--kairos-rule` (18%, decorative lines) and
`--kairos-rule-frame` (20%, a photo slot's edge). Both stay `rgba()`, as the
brief has them, so they read the same on cream, white and both greens. They are
never paired for contrast and never a control edge. `--kairos-border` keeps its
meaning and value.

The brief's control edges keep their own roles: `--kairos-control-edge` (ink)
for a choice control's edge, and `--kairos-field-border` (ink-3) for a field at
the Brand Scale.

## Consequences

- `tests/brand-tokens.test.mjs` fails any border or outline on a control's
  own element that reads `--kairos-rule` or `--kairos-rule-frame`, so a
  hairline cannot become a control edge by accident.
- The brief's name and the package's name differ for this role. The token
  layer's comment and the Colour page say which is which.
