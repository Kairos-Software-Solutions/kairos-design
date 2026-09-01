# Buy behaviour and build appearance

## Context

The README argues for CSS first because React reaches two of five Kairos
surfaces, so a React-only package would leave three behind. That count is out of
date. Measured against what ships today:

| Surface | React | Bundler | Radix already | kairos-design |
| --- | --- | --- | --- | --- |
| Paykit | Next 16, React 19 | yes | dialog, select, tabs, tooltip | vendored classes |
| Mailkit | Next 15, React 19 | yes | dialog, select, tooltip | vendored classes |
| Uptime | React 19 on Vite | yes | dialog | `^0.2.6`, React layer, 6 files |
| Card | no | no | none | `^0.2.7`, CSS only |
| Mailclient | no, Roundcube skin | no | none | emitted CSS |

Three of five run React with a bundler. Uptime is described in the README as
hand-written CSS with no bundler; it runs React 19 on Vite and imports
`kairos-design/react` in six files.

The registry is missing pagination entirely, has row selection styled but not
built, and has no combobox, tooltip or determinate progress. Those are all
behaviour. Meanwhile Paykit and Mailkit each independently installed
`@radix-ui/react-select` and `@radix-ui/react-tooltip` and finished neither: the
only files importing Radix across both apps are two `Dialog.tsx` wrappers and one
Paykit screen. Two teams reached the same conclusion, took the same dependency,
and both stalled.

Radix Dialog is already a peer dependency here, with the reasoning recorded: a
modal has to trap focus, restore it, close on Escape and mark the rest inert, and
hand-rolling that in a shared component gives every Kairos app the same keyboard
trap.

## Decision

The registry buys behaviour and builds appearance.

Behaviour means state machines, keyboard handling, focus management, positioning
and collision detection. It is bought from headless libraries, which emit no
markup opinions and no CSS, so they compose with `kairos.css` rather than
competing with it. Every `kairos-*` class survives a library adoption unchanged;
if one does not, the library was not headless and is the wrong library.

Appearance means the tokens, the class vocabulary, `base.css`, the formatters,
and the components that hold no behaviour: `StateChip`, `Button`, `Panel`,
`Banner`, `EmptyState`, `SectionTag`, the theme system. No library supplies a
cream ground, a stamped offset shadow, a zero-radius button or Bebas on the page
title, and that is the whole value of this repo.

CSS first still holds for the visual layer, because Card and Mailclient are real
and a stylesheet is what reaches them. It stops being a reason to refuse a React
dependency for behaviour. Nothing that needs a paginated table with sortable
columns and bulk selection is going to be a static HTML page, and the two
surfaces that are static have no such screen.

Component libraries that ship appearance are refused: Mantine, MUI, Chakra and
Ant Design each assume rounded corners, blur-based elevation and a neutral
palette, which is the opposite of every Kairos default. Overriding them costs
more than building did.

shadcn/ui is refused as a dependency for the reason `decisions.md` already gives
against vendoring: copying components into an app works because the app owns and
edits the copies, and this repo would take the duplication without the ownership.
Reading it for how to compose Radix is encouraged.

A behavioural dependency enters as a peer dependency, marked optional where only
some components need it, so an app importing `Button` does not install a table
engine.
