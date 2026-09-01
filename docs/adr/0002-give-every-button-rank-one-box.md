# Give every button rank one box

## Context

Five of the six button ranks measure 84px wide for a given label. `tertiary`
measures 64px, because it overrides the base `padding: 0 var(--kairos-pad-control)`
with `padding-inline: var(--kairos-space-2xs)` and sets its border width to zero.
`ghost` measures 80px, keeping the padding and dropping only the border.

The label is centred inside all six. Slack left equals slack right every time,
so nothing is misaligned within its own box. What breaks is the shared edge
between boxes: in a left-aligned column, a tertiary label starts 16px from the
edge where a bordered rank starts at 26px and a ghost at 24px.

The branding skill states the rule this breaks. Buttons in one group share a
height and a width. Tertiary cannot satisfy it while it sets its own padding.

`kairos-action-row--equal` makes it stranger. The grid stretches every button to
one track, the tertiary label centres in a track it did not size, and the
underline spans the label alone. A link floating in the middle of an invisible
full-width button.

## Decision

Borderless ranks take a transparent border rather than no border.
`--button-border: transparent` on `tertiary` and `ghost`, with the border width
left at `--kairos-border-w-strong`, and tertiary's `padding-inline` override
deleted.

Every rank then measures 84x36 for the same label, with the label at 26px from
the box edge, verified by measurement rather than by eye.

The underline stays on the label rather than the box, because that is what makes
tertiary read as a link. Rank is still carried by fill, border and shadow, and
geometry now carries nothing at all, which is the rule the skill already states:
size is not a rank.

The Button Matrix story stacks the ranks in a column against a guide, so a
broken left edge is visible in the workshop. The matrix rendered all six ranks
in every state for three versions and did not surface this, because nothing in
its arrangement put the edges next to each other. Rendering a component is
necessary and not sufficient; the arrangement decides what a reviewer can see.
