# Let the theme toggle drop its word

## Status

Accepted, 0.12.0.

## Context

`ThemeToggle` has always shipped the word beside the glyph, and the CSS said why:

> The word always ships with the glyph. A lone sun or moon is the most commonly
> misread control in this class, because it is ambiguous about whether it shows
> the current theme or the one you would get.

That reasoning is correct and it is not what this ADR overturns. It was written
for the placement the component was built for — a floating button in the corner
of a screen with no chrome, where the control stands alone and the only thing
telling a reader what it does is the control itself.

The marketing site put it somewhere else. In `kairossolutionstt.com`'s header the
toggle sits in a row: five navigation links, then the toggle, then the page's one
amber call to action. Rendered there, the first word of the tri-state — `SYSTEM` —
is a bordered pill in tracked caps immediately left of `BOOK A FREE BUSINESS
REVIEW`. An audit of the live site measured the result: between `lg` and `xl` the
call to action is hidden and the toggle is not, and on a phone the toggle is the
most prominent control in the header. A visitor who is not a developer reads
`SYSTEM` as a product, a portal, or a section of the site.

So the word is right in one placement and wrong in another, and the package only
offered the one.

## Decision

`ThemeToggle` takes `labelled`, defaulting to `true`. `labelled={false}` renders
the glyph alone in `.kairos-theme-toggle--icon`.

The default does not change. An app that wants the icon has to say so, at the
call site, which is where the placement is known.

The ambiguity the word carried is carried by `title` and `aria-label` in both
variants. Both already named the current theme and the next one — *"Theme
follows your device. Switch to light."* — so a screen reader and a hovering
pointer lose nothing. What a touch user loses is real and is the cost of the
variant; it is accepted only where the control is one of several and the row
around it says what kind of control it is.

`.kairos-theme-toggle--icon` sets `min-width` as well as inheriting `min-height`.
The word was what held the button open horizontally, and a 44px floor in one
dimension is not a tap target.

## Consequences

- Use `labelled={false}` where the control sits among other controls and the word
  would outrank them. Keep the default everywhere the control stands alone — the
  floating button on a public page, the sign-in screen, the mobile top bar of a
  shell.
- Where a shell is present the control is still `ThemeSetting`, a settings row
  with all three options visible. This variant changes nothing about that
  placement and is not an alternative to it.
- A contract test asserts both dimensions of the icon variant and asserts that
  the title and the accessible name survive it, so the trade recorded here cannot
  be quietly widened into a default.
