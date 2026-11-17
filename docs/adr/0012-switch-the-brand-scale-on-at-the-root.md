# Switch the Brand Scale on at the root

## Status

Accepted, 0.15.0.

## Context

Kairos design brief v1 gives the company's brand surfaces, the website first,
a different shape from the apps: 50px buttons with a 3px corner and sentence
case labels, 52px fields, soft shadows where the apps have the ink stamp, a
3px focus ring, larger type ranks and a slower motion curve. The apps keep
their Product Scale, and must not change by a single declaration when they
bump to the release that carries the brief.

The colours and the font families are the same on both kinds of surface. The
geometry, the type ranks and the motion are not.

Three ways to ship the second shape were open: a second `tokens.css`, a class
on a wrapper element, or one opt-in stylesheet behind an attribute.

## Decision

The Brand Scale is `dist/brand.css`, exported as `kairos-design/brand.css`. It
is one rule, `:root[data-scale='brand'] { … }`, holding only custom
properties: no colour value (colours come from `tokens.css` through `var()`),
no class rule, no `@font-face`, no `url()`, and never
`--kairos-duration-none`. Every token it sets has a Product Scale default in
`tokens.css`.

A surface opts in by importing the file and setting `data-scale="brand"` on
`<html>`. Import order is tokens, base, brand, components.

Existing parts read component knobs (`--kairos-button-*`, `--kairos-input-*`,
`--kairos-field-message-*`, `--kairos-focus-*`, `--kairos-type-*`) whose
defaults reproduce 0.14. Where the brief adds a declaration no default can
make inert, `kairos.css` carries a rule that begins
`:root[data-scale='brand']`, which cannot match without the switch.

## Consequences

- Importing `brand.css` changes nothing on its own, so a shared stylesheet can
  import it and let each page decide.
- The selector's specificity, (0,2,0), beats the light and dark blocks without
  `!important`, so import order stops deciding it.
- The switch belongs on the root. A role token built from other tokens resolves
  on the element that declares it, so a switch set on a descendant would leave
  those tokens resolved at the root's scale. The adoption guide says so; nothing
  enforces it.
- The workshop renders both scales in one build: a story asks for the switch
  with `parameters: { scale: 'brand' }`, and a decorator removes it for every
  other story.
- `tests/product-scale.test.mjs` proves the Product Scale against the published
  0.14.0 stylesheets; `tests/brand-scale.test.mjs` pins the file's shape and
  values.
