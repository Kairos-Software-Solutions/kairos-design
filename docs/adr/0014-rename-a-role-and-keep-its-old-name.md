# Rename a role and keep its old name

## Status

Accepted, 0.16.0.

## Context

Kairos design brief v1 names nine roles the package already had under other
names: the page (`bg`), the card (`surface`), three inks (`text`, `text-2`,
`text-muted`), the highlight and its stronger hover (`accent`,
`accent-hover`), the colour on the highlight (`accent-text`) and the focus ring
(`focus`). The values were already the brief's, apart from the hover.

Keeping the old names would leave the brief and the code speaking two
vocabularies. Renaming them outright would break every app that reads or
overrides one.

Custom properties inherit their computed value. An alias declared on `:root`
alone resolves there, so an element lower down that sets `data-theme="dark"`
would inherit the old name already resolved to its light value.

## Decision

The brief's name becomes the token, declared in the light and dark blocks. The
0.14 name stays as an alias, `--kairos-bg: var(--kairos-page)` and so on, in
its own block with the selector `:root, [data-theme]`, placed after the light
block and before the dark one, so an old name re-resolves on every element
that sets a theme. Existing rules keep reading the old names; new rules read
the new ones.

## Consequences

- No app has to change a token name on the bump, and an app overriding an old
  name keeps its override for every rule that reads that name.
- New parts read the new names, so an app overriding only an old name does not
  restyle them. The adoption guide lists the pairs.
- `tests/brand-tokens.test.mjs` pins the alias block's selector and place,
  and that every 0.14 name resolves to its 0.14 value in both themes, apart
  from the listed changes (the font stacks and the light hover).
- `kairos-design emit` copies `tokens.css` as it is, so an emitted copy carries
  the canonical names in the light block and the aliases after it.
