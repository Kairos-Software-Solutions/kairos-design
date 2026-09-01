# Take menu and overlay behaviour from Radix

## Context

`OverflowMenu` portals itself to `<body>`, keeps `position: fixed`, measures its
trigger with `getBoundingClientRect()` on open and again on scroll and resize,
and flips above the trigger when the space below is short. All of that exists
because a table panel is an `overflow-x: auto` container and an absolutely
positioned menu inside a row is clipped by it.

The manifest records the failure mode: an app stylesheet that re-declares
`.kairos-overflow-menu { position: absolute }` has bought the clipping back. A
shared component whose correctness depends on no consumer writing one plausible
CSS rule is a liability we are choosing to own.

The registry has no combobox. `kairos-select` styles the native element, which
is correct for a short list and unusable for a customer picker with three
hundred entries. There is no tooltip, so an icon-only control carries an
`aria-label` for screen readers and nothing at all for a sighted mouse user.
There is no popover.

Radix Dialog is already a peer dependency and the reasoning for it is recorded.
Paykit and Mailkit each already declare `@radix-ui/react-select` and
`@radix-ui/react-tooltip` and use neither.

## Decision

The registry takes Radix for the remaining overlay and menu behaviour:
DropdownMenu, Tooltip, Popover, and Select for the combobox.

`OverflowMenu` keeps its name, its props and its classes, and is rebuilt on
Radix DropdownMenu. Radix does collision detection, focus management, typeahead
and Escape handling, and its positioning is not defeatable by an app stylesheet
declaring a rule about our class. The hand-rolled measurement code is deleted
rather than kept as a fallback: two positioning strategies in one component is
how the wrong one ships.

`Tooltip` and `Popover` are new, and are the named wrappers apps stopped short
of building themselves.

`Select` is the combobox, and it replaces nothing. `kairos-select` and the
native element stay for short lists, because a native select on a phone opens
the platform picker and that is better than anything we would build. The
manifest's "Do not use for" cell carries the split, and the threshold is stated:
above roughly a dozen options, or wherever the user needs to type to find an
entry, use `Select`.

All of it is one peer dependency, `radix-ui`, marked optional. An app importing
`Button` installs nothing. This does not widen the dependency surface so much as
name it: three of five surfaces already have Radix in their lockfile.

Radix stays the only behavioural dependency for overlays. A second library
covering the same ground means two focus-management strategies in one app, which
is the trap ADR 0005 exists to avoid.
