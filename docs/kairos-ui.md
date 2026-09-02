# Kairos UI — the registry

The canonical component manifest. Every Kairos app reads this one, rather than
keeping its own list, so a fix lands once and reaches every surface.

Read this before building any UI. If you add a component, add its row here in
the same change: a component that is not in the manifest does not exist for the
next agent.

```
Tokens      dist/tokens.css        --kairos-*, light and dark
Base        dist/base.css          element defaults, optional
Components  dist/kairos.css        the kairos-* class vocabulary
Money       dist/format/money.ts   TTD 8,500.00
Dates       dist/format/dates.ts   24 Aug 2026
React       dist/react/            components emitting the classes above
Preview     docs/preview.html      every component, both themes
Emit        kairos-design emit     writes the CSS into a surface with no bundler
```

Everything above is reachable as `kairos-design/<name>` once the package is
installed. Import order is tokens, base, components.

`base.css` sets the page: ground, ink, body type, the 320px floor, and the
`[hidden]` reset. Import it and an app needs no stylesheet of its own to render
a Kairos page — what stays in the app is composition wired to its own data.

## Foundations

Read this section before writing a value. Everything below it is composition;
this is the part that decides whether two screens look like one system.

A number written by hand is the mechanism by which two apps that both use this
package end up looking nothing alike. An agent building a new screen has to
pick a spacing, and with no scale to pick from it picks a new one. Before these
scales existed, `kairos.css` shipped 38 distinct padding values, 13 gaps, 33
font sizes, and 11 tracking values against 3 tracking tokens — and referenced
none of the tokens that named them. `npm test` now fails on a literal where a
token exists, so this is enforced rather than requested.

### Space

Nine steps, fine at the bottom and coarse at the top. Every padding, margin,
and gap in the system is one of these.

| Token | Value | Reach for it when |
| --- | --- | --- |
| `--kairos-space-3xs` | 2px | Two things that are one thing: a glyph and its chip label |
| `--kairos-space-2xs` | 4px | Inside a control |
| `--kairos-space-xs` | 6px | A label and the control under it |
| `--kairos-space-sm` | 8px | Siblings in a row: chips, nav rows |
| `--kairos-space-md` | 12px | Table cell padding, fields in a form |
| `--kairos-space-lg` | 16px | Panel padding, and the gap between panels |
| `--kairos-space-xl` | 24px | Between sections on a screen |
| `--kairos-space-2xl` | 32px | A sign-in panel, a page that is one block |
| `--kairos-space-3xl` | 48px | Brand Scale only |

Role tokens sit on top, so a call site names its decision rather than its size:
`--kairos-panel-pad`, `--kairos-section-pad`, `--kairos-page-pad`,
`--kairos-screen-pad`, `--kairos-pad-control`, `--kairos-pad-cell-x`,
`--kairos-pad-cell-y`, `--kairos-gap`, `--kairos-field-gap`,
`--kairos-form-gap`. Making cells tighter everywhere is one edit to
`--kairos-pad-cell-y`, not a search for `12px`.

The last two are form density. `--kairos-field-gap` is the gap between a
field's label, control and message; `--kairos-form-gap` is the gap between
fields. They default to `xs` and `lg`, and they are what every form in every
consuming app resolves through, so a tighter form is one edit rather than two
literals in two rules.

From an app, reach the scale through `kairos-stack--*` and `kairos-pad--*`
rather than through the tokens. Those modifiers are the scale.

### Type

Eight steps. `--kairos-text-body` stays in `rem` so a reader's browser setting
still moves it; the rest are `px`, because the ranks being removed were
half-pixel ones.

| Token | Value | Rank |
| --- | --- | --- |
| `--kairos-text-2xs` | 10px | A count on a nav row |
| `--kairos-text-xs` | 11px | State chips, table headers |
| `--kairos-text-sm` | 12px | Buttons, field labels, hints |
| `--kairos-text-md` | 13px | Nav rows, secondary body |
| `--kairos-text-body` | 0.875rem | Body, table cells |
| `--kairos-text-lg` | 16px | Panel headings, and every text input |
| `--kairos-text-xl` | 20px | A large figure |
| `--kairos-text-title` | 24px | The page title, in Bebas, once per screen |

Role aliases: `--kairos-text-heading`, `--kairos-text-label`,
`--kairos-text-chip`, `--kairos-text-button`, `--kairos-text-meta`,
`--kairos-text-input`. An input takes 16px because below that Safari zooms the
page when the field is focused.

### Tracking

Four ranks, because nobody can tell 0.08em from 0.09em and the stylesheet was
shipping both. `--kairos-track-display` (0.02em), `--kairos-track-heading`
(0.06em), `--kairos-track-label` (0.08em), `--kairos-track-button` (0.14em).

### Breakpoints

Seven, and they are **documented constants referenced by convention, not
tokens**. That is forced, not chosen: a CSS custom property cannot be used in a
media query, because the query is evaluated before the cascade resolves one.
The alternative is `@custom-media`, which needs a PostCSS build — and this
package has deliberately never had a build step, since `dist/` is hand-edited
source and the export map points straight at it. Naming seven numbers is not
worth a toolchain. The numbers are typed by hand at each `@media`, and the
register lives at the foot of `tokens.css`.

Nothing enforces this list. Check it before adding an eighth width.

| Width | What moves |
| --- | --- |
| 420px | Dialog actions stack |
| 520px | The filter bar's search field takes its own row |
| 640px | An equal-width action row collapses to one column |
| 768px | The table-to-card swap, and the main mobile boundary |
| 900px | The sidebar appears and the bottom nav goes |
| 980px | The login grid collapses to one column |
| 1200px | The main region takes its roomiest padding |

Where a boundary needs both sides it is written as a complementary pair —
`max-width: 767px` against `min-width: 768px`, `max-width: 899px` against
`min-width: 900px`. That is one boundary written correctly, not two widths.

All seven were measured either side in a browser, and each one changes a layout
no other one changes — so this is already the smallest set that keeps every
layout correct. Folding 420 and 640 into 520 was tested and rejected on the
numbers; see `docs/decisions.md`.

The filter bar shows the alternative. It reflows from one column to four across
seven widths on `auto-fit` and `minmax` alone, with no media query at all.

### Line, radius, and the stamp

Two border weights and no third: `--kairos-border-w` draws a container and
separates rows inside one, `--kairos-border-w-strong` marks a control that
takes input and the rule under a table header. `--kairos-rule-w` is the 4px
accent bar down the side of a banner, which is a marker rather than a border.
The focus ring takes `--kairos-focus-w`.

Radius is sharp by default: `--kairos-radius-button` is 0,
`--kairos-radius-chip` 2px, `--kairos-radius-input` 4px, and
`--kairos-radius-panel` 10px. Softer radii belong to the named Brand Scale card
families and to nothing in a tool.

The stamp is flat, offset bottom-right, zero blur, zero spread, and it inverts
to linen on dark. It has four ranks and they mean something:

| Token | Offset | On |
| --- | --- | --- |
| `--kairos-shadow-pressed` | 2px | A filled button while it is held |
| `--kairos-shadow` | 4px | A filled button at rest, and a card |
| `--kairos-shadow-card` | 6px | A panel, and a filled button under the cursor |
| `--kairos-shadow-lg` | 8px | A dialog |

**A top-level panel stamps; anything nested inside one is flat.** One rule, so
nobody has to decide. Two stamps stacked read as a printing error rather than
as depth, and `kairos.css` enforces it — `.kairos-panel .kairos-panel`,
`.kairos-card`, and `.kairos-subpanel` all drop to `none`.

Only the filled button ranks carry a stamp at all. An outline button is already
drawing its own boundary, and a stamp under it reads as a second border.

### Motion

`--kairos-duration-fast` (120ms) for a control acknowledging a press,
`--kairos-duration` (200ms) for a state change, `--kairos-duration-enter`
(450ms) for something arriving on the page. `--kairos-ease` is the only easing.

## Shell

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-app-shell` | App frame: sidebar or bottom nav plus main region | Brand Scale pages | — |
| `kairos-sidebar` | 220px desktop nav | Mobile; use `kairos-bottom-nav` | — |
| `kairos-sidebar-brand` | The lockup block at the top of the sidebar | A second logo anywhere else on the screen | — |
| `kairos-bottom-nav` | Five-item mobile tab bar | More than five destinations | — |
| `kairos-topbar` | Mobile brand row | Desktop | `--switcher` |
| `kairos-page-header` | 56px row: title left, actions right | A second header inside a panel | — |
| `kairos-page-title` | The one Bebas element on the screen, 24px | Any other heading | — |
| `kairos-page-header-description` | One line of supporting copy under the title. `PageHeader` renders it from its `description` prop | A paragraph; keep it to a sentence | — |
| `kairos-view` | The centred content column inside `kairos-main` | A tile dashboard that wants the full width | — |
| `kairos-filter-bar` | The row above a record list: search, segmented filters, and any field the screen filters by. `FilterBar` renders it | Sorting; the table header does that. A submit button on a bar that narrows live | — |
| `kairos-theme-toggle` | System / Light / Dark | Any other setting | `--inline` |
| `kairos-skip-link` | First focusable element on every page | — | — |
| `kairos-shell-body` | The column beside the sidebar that holds the topbar and `kairos-main`, and owns the viewport height | A content wrapper inside `kairos-main`; that is `kairos-view` | — |
| `kairos-nav-link` | One sidebar destination, `36px`, amber on `[aria-current="page"]` | An action; a nav row goes somewhere | — |
| `kairos-nav-group` | The label over a group of nav rows, `10px` tracked caps | A nav row itself | — |
| `kairos-nav-sheet` | The full-screen nav a phone opens from the topbar, below `900px` | Desktop, and any list of actions; that is `kairos-overflow-menu` | — |
| `kairos-breadcrumb` | The trail above a page title, and only where nesting is real | Restating the nav item you are already on | — |
| `kairos-tabs-list`, `kairos-tab` | Tabs within one record, ruled underneath, active on `[data-state="active"]` | Filtering a list; that is `kairos-segmented`. Navigation between pages; that is `kairos-nav-link` | — |
| `kairos-wizard-step` | One step in `kairos-wizard-steps`, with `[data-done]` and a `-marker` | A tab; a step has an order and a completion | — |
| `kairos-tool-surface` | A one-panel screen centred in the viewport: sign-in, a not-found, a single prompt | An app screen with a shell; that is `kairos-app-shell` | — |
| `kairos-sign-in`, `kairos-auth` | The panel on that surface, capped at `25rem` and `24rem` and never wider than the phone it is on | Two names for one thing in a new screen — pick `kairos-auth`, which carries the form, header and link elements | — |
| `kairos-login-grid` | The two-column sign-in layout, collapsing at `980px` | A content grid; that is `kairos-grid-auto` | — |
| `kairos-setting-row` | A settings label and its control on one line, wrapping | A form field; that is `kairos-field` | — |

## Data

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-table` | Repeating records, desktop | Fewer than 3 records; heterogeneous summaries | — |
| `kairos-table-wrap` | The scroll container around a table | A panel that should swap to cards instead | — |
| `kairos-table-panel` | **A modifier on `kairos-panel`**, never a replacement. Removes the padding and clips the header band to the radius | Writing it alone: on its own it paints no border, no ground, no radius, and no stamp | — |
| `kairos-sort-header` | Header-cell sort button, carries `aria-sort` | Headers with no natural order | — |
| `kairos-pagination` | The one pager under a record list: the position sentence at one end, the controls at the other | A second pager for the cards; the table and the cards are one list and share it | — |
| `kairos-pagination-controls` | The Previous/Next pair inside `kairos-pagination`, kept together when the sentence wraps above them | Page-number links; a list this size does not need them | — |
| `kairos-selection-cell` | The checkbox column on a selectable table, header and body. Always first, always narrow | A second control column; `DataTable` renders this one from `selectable` and a call site cannot declare another | — |
| `kairos-bulk-bar` | The bar over a list with a selection: the count at one end, a slot for what the screen does with it at the other | Composing the actions inside the slot; that is `ActionSet` | — |
| `kairos-record-card` | The same records below 768px | Desktop lists | `--inert` |
| `kairos-collapsible-card` | Detail-heavy cards, collapsed by default | Cards of 3 fields or fewer | — |
| `kairos-state-chip` | Status of a record | Counts, labels, categories | `--settled` `--overdue` `--awaiting` `--draft` `--neutral` |
| `kairos-panel` | Bordered container, no shadow. Ground and border only — pair it with `kairos-pad` | A shadowed featured panel; that is Brand Scale | — |
| `kairos-pad` | The padding inside a panel or card | Spacing between blocks; that is `kairos-stack` | `--xs` `--sm` `--lg` |
| `kairos-empty-state` | A list or table with no records | Errors; use `kairos-banner` | — |
| `kairos-metric` | A single figure with its label | A figure inside a table cell | — |
| `kairos-skeleton` | Loading placeholder shaped like its content | Empty states | `--line` `--heading` `--label` `--row` `--control` `--summary` |
| `kairos-figure` | Money and any figure that must not break across lines | Text | — |
| `kairos-record-list` | The card list below `768px`. It is `display: none` above that width, so it is the pair to `kairos-desktop-table` and not a layout you reach for directly | A grid of cards on desktop | — |
| `kairos-record-rows`, `kairos-record-row` | Records inside a panel as ruled rows rather than a table: a dashboard summary, a short related list | Repeating records with columns to compare; that is `kairos-table`. Fewer than three; write them out | — |
| `kairos-record-open` | The whole-row target on a ruled row, with `-label` naming the record | A table row; the row handler and the identifier link do that | — |
| `kairos-record-link` | The linked identifier in a row or card. Bold, so the identifier is the heaviest ink in the row | `Open` or `View`; the link text has to name the record | — |
| `kairos-cell-note` | A second line under a cell's value, muted and small | The value itself | — |
| `kairos-cell-secondary` | A cell that reads one rank below the identifier | Muting a whole column; the data is the heaviest ink on the screen | — |
| `kairos-columns-cell` | The column-visibility control's cell, last and narrow, beside `kairos-selection-cell` | A second action column; the row carries the identifier, the menu and the checkbox and nothing else | — |
| `kairos-tile` | A dashboard count as a link: `-heading`, `-name`, `-count` | A figure with no destination; that is `kairos-metric` | — |
| `kairos-definition-grid` | A record's fields as a `<dl>`, label over value, on a detail screen | A form; a definition list is read, not edited | — |

A table panel takes three classes: `kairos-panel kairos-table-panel
kairos-desktop-table`. Paykit's call sites always wrote all three; when that
pattern moved into `DataTable` the first was dropped, and for three versions
every table the registry rendered floated on the page with no container at all.
`.kairos-table-panel:not(.kairos-panel)` now draws a dashed red outline so the
mistake is unmissable rather than invisible, and a test fails on it.

`kairos-panel` paints the border, the ground, the radius, and the stamp; the
padding is `kairos-pad`, a separate class. A panel written by hand takes both. The
`Panel` component applies `kairos-pad` for you and drops it when you pass
`flush`, so a table can supply its own — which is the whole meaning of that
prop, and it was inert for as long as the component applied no padding to
remove.

One list has one pager. The table above 768px and the cards below it are two
renderings of the same records, so `kairos-pagination` sits under both rather
than inside the table panel, and the cards page exactly as the table does. A
second pager would give one list two positions to be in and would announce the
same page change twice. Infinite scroll on the cards is a different product
decision and is not this.

The position reads as a sentence — `Showing 1 to 25 of 300` — and that sentence
is the live region. Sorting needs a hidden announcer because a re-ordered table
says nothing a screen reader can read; a page change already writes its new
position on the screen, so the words a sighted reader sees are the words that
get announced. No pager renders when the records fit one page.

Selection is a table affordance, not a column. `DataTable` renders it from its
`selectable` prop, so the checkbox is always the first cell and there is never
a second one — a call site that can declare a selection column can declare two,
and can put one last. The row still carries three things and no more: the
linked identifier, the overflow menu, and the checkbox.

A selection survives a sort and a page change, because it is keyed by the row
id the call site supplies rather than by position. `kairos-bulk-bar` states the
whole count, not the part of it currently on screen, so records ticked on page
one stay discoverable from page three. The bar's action slot ranks nothing and
arranges nothing; the composition of those actions is `ActionSet`.

Below 768px the list renders as record cards, and a card carries no checkbox.
What a card renders is the `record-card` contract and it is settled elsewhere.

Columns run in the order the user reads a record by: the human-readable
identifier, then the secondary identifiers that separate two similar names,
then dates and statuses, then figures, then actions. `DataTable` takes the
order from its `columns` array. Tables written before this rule lead with the
status chip; that is the superseded order, not a local choice to preserve.
Where the hierarchy leaves the order open, ask rather than guess.

## Actions

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-button` | Any action, on a `<button>` or on an `<a>` that navigates | — | `--sm`, and `[aria-busy]` for one waiting on a response |
| `kairos-button-stack` | The two label cells of a button that can load, sharing one grid area so the box is the wider of them in both states | A button that cannot load; it takes no wrapper and renders its children directly | — |
| `kairos-page-header-primary` | The one primary action on the screen | A second amber claim | — |
| `kairos-action-row` | A row of buttons | A single button | `--equal` `--end` `--top` |
| `kairos-overflow-menu` | Secondary and destructive row actions | The primary action | — |
| `kairos-overflow-item` | One row inside the menu | — | `--destructive` `--divided`, and `[data-disabled]` for one that is unavailable |
| `kairos-dialog-content` | Modal surface | Page-level notices | — |
| `kairos-segmented` | Filters and wizard steps | Anything styled as a button row | `--links` |
| `kairos-icon-action` | An icon-only control that has an `aria-label` naming its record | A rail of three per table row | `--accent` `--danger` |
| `kairos-overflow` | The inline wrapper the menu trigger sits in | Positioning the menu; Radix owns that wrapper and a rule here cannot move it | — |
| `kairos-inline-action` | An underlined action inside a sentence or a cell, `24px` target | A ranked action; that is `kairos-button--tertiary` | — |
| `kairos-inline-actions` | Two or three inline actions pushed to the end of a row | A row of buttons; that is `kairos-action-row` | — |
| `kairos-dialog-actions` | The footer of a dialog, actions to the end, stacking full-width below `420px` | Composing or ranking them; that is `ActionSet` with `context="dialog"` | — |
| `kairos-dialog-overlay`, `kairos-dialog-title` | The scrim and the heading of a dialog. `Dialog` renders both | A page-level heading; that is `kairos-page-title` | — |
| `kairos-block` | A button that fills its container, on a phone or in a stacked dialog footer | A desktop action row, where a full-width primary reads as a banner | — |

Destructive actions live in `kairos-overflow-item--destructive` and are gated by
a dialog that names the record. The confirm button takes the destructive
treatment, never amber.

**A button waiting on a response is not a disabled one.** `aria-busy` keeps the
rank's fill, border and stamp and takes none of the disabled treatment: the two
disabled signals say "still unavailable when you look back", and greying out
the action somebody just pressed reads as the press having failed. What it loses
is hover, press, and any further click. It keeps its tab stop — `disabled` would
move focus to the body at the moment the answer arrives, on the control the user
just pressed Enter on — so `aria-disabled` carries the state and the click
handler refuses the press.

The box is held by rendering both labels into one grid cell, so it measures the
wider of the two in every state. A label swapped in place measures its own
content, and `Save` becoming `Saving…` is a button that grows under the pointer
that is still on it.

In React, do not assemble these by hand. `ActionSet` takes the actions and
decides the rank, the placement, the order and the confirmation; the one
judgement it leaves you is which action is primary on the screen.

## Forms

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-field` | Label, control, hint, and error as one unit | Read-only display of a value | — |
| `kairos-input-field` | Text, number, textarea; 16px minimum | — | — |
| `kairos-select` | Native select, styled; wrap in `kairos-select-wrap` for the caret. Also the combobox trigger, which is the same box | More than ten options — past that a person cannot see the list and needs to type, and this control cannot be typed into | — |
| `kairos-combobox` | The combobox trigger, beside `kairos-select` — adds the value/caret layout a button needs and a select does not | Ten options or fewer, where the native select opens the platform picker on a phone | — |
| `kairos-combobox-menu` | The list a combobox opens, with `-filter`, `-list`, `-item`, `-tick` and `-empty` inside it | Row actions; that is `kairos-overflow-menu` | — |
| `kairos-input-label` | The field label, uppercase and tracked | A heading | — |
| `kairos-field-hint` | What the field expects | Error text | — |
| `kairos-field-error` | Plain language saying what to do next | A generic failure string | — |
| `kairos-wizard-steps` | Multi-step progress | A button row | — |
| `kairos-form-grid` | Fields across the width, `auto-fit` from `220px`, bottoms aligned | A single column; that is `kairos-form-stack` | — |
| `kairos-submit-wrap` | A submit button with a status line reserved beneath it, so a result arriving moves nothing | Wrapping a whole form | — |
| `kairos-action-status` | The line under a submit saying what happened | A page-level notice, which is `kairos-banner`, or a field's own error, which is `kairos-field-error` | — |
| `kairos-submit-error` | A failed submit, with the accent rule down its left edge | A field-level error | — |
| `kairos-error-text`, `kairos-row-error` | Error text in brick, `13px` | A new screen. These two are the same declarations under two names, and `kairos-field-error` is the one inside a field — reach for that first and use these only where an error has no field to belong to | — |

A field holds its label, hint, and error rows whether or not they carry
content, so validating a form does not move the layout.

**Ten is the boundary between the two chooseers, and it is a number rather than
a judgement.** Ten options or fewer: the native `<select>`, which opens the
platform picker on a phone, works before hydration, and costs nothing. More
than ten: `Select`, which puts a filter box above the list, because past that
a person can no longer see whether what they want is in it. The same number
decides whether that filter box appears, so there is one boundary and not two.

## Feedback

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-banner` | Page-level notice, one per screen | Field-level errors | `--danger` `--warning` `--success` `--inline` |
| `kairos-toast` | Transient confirmation of a completed action | Anything the user must act on | — |
| `kairos-toast-region` | The fixed container, `role="status"` | — | — |
| `kairos-progress-dot` | The pending ring, in `currentColor`, so it takes the colour of whatever it sits in | Determinate progress; a ring that never fills cannot show how far along a batch is | — |
| `kairos-spin` | The rotation, on its own class so anything can turn | Carrying the meaning by itself. Under `prefers-reduced-motion` the guard stops it after one pass, and a static ring says nothing — pair it with a word | — |
| `kairos-tooltip` | A short explanation attached to a control, on hover or focus | A control's only name or description — hover does not exist on touch and does not appear in a screenshot | — |
| `kairos-popover` | A small panel of content or controls anchored to what opened it | A list of actions, which is `kairos-overflow-menu`; or anything you need an answer to, which is `kairos-dialog-content` | — |

There is no accent banner. Amber is the action colour, and a banner is not an
action.

## Brand

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-lockup` | The CDN wordmark, theme-switched | A redrawn or recoloured logo | `--light` `--dark` |
| `kairos-wordmark` | Text wordmark where the image will not fit | Replacing the lockup on a login screen | — |
| `kairos-section-tag` | Opening a section on a Brand Scale page: a label, then a rule to the edge | A heading inside a panel; that is `kairos-section-title` | — |
| `kairos-kicker` | The eyebrow over a page title, and only where it names real nesting: `Invoices` above `Invoice INV-0042` | A top-level screen, where the nav item repeated above the title is two lines of chrome carrying no information | — |

Logos are linked from `https://cdn.kairossolutionstt.com` by URL, never copied
into a repo. Ship both variants, with the same `alt` on each, and let the
ground pick. The ground is `[data-theme]` — the same signal the tokens read,
and the only one, so the artwork cannot end up on a surface it was not drawn
for.

`kairos-section-tag` styles its own label, so the call site passes text and
nothing else. The two close names are deliberate: the skill calls this pattern
the section tag, and `kairos-section-title` is the Epilogue heading inside a
`kairos-section` panel. Brand Scale and Product Scale, and they are never
interchangeable.

`kairos-sidebar-brand` is the exception worth knowing. It is an inverted
plaque, ink under a light page and bone under a dark one, so the lockup on it
is whichever variant the rest of the page is hiding. The markup is the same
two images; the stylesheet flips them. Do not set `display` on a lockup from
an app rule — a selector like `.my-brand img` outranks the lockup's own and
renders both at once, one stacked on the other's cream tile.

## Layout and utilities

The stylesheet carries more than this manifest used to name, and an undocumented
class is one the next agent reinvents. These are the ones an app reaches for
often enough that writing them again is the likely mistake.

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-stack` | A vertical stack with one gap | Two blocks that want different gaps; nest instead | `--xs` `--sm` `--md` `--lg` `--xl` |
| `kairos-split` | Two groups pushed to opposite ends of a row, wrapping | A grid of equal columns | `--sm` `--md` `--lg` `--baseline` `--top` `--end` |
| `kairos-form-stack` | The fields inside one form section | Spacing between panels | — |
| `kairos-grow` | The flex child that takes the remaining width and can still shrink | A fixed column | — |
| `kairos-measure` | Prose at a readable width | A table | `-sm` `-lg` |
| `kairos-code` | An identifier read or copied character by character | Body text | — |
| `kairos-code-block` | Machine output shown to an operator: a response body, a log line | Prose; it is capped and scrollable | — |
| `kairos-copy-field` | A technical value an operator pastes somewhere else: a DKIM record, an object key, a digest. `-value`, `-body` and `-status` inside it, and `CopyField` renders the lot | A form field. Nothing here is editable, and an `<input readonly>` invites typing into it | — |
| `kairos-muted` | Secondary text | The data itself; the heaviest ink is the record | — |
| `kairos-chip-row` | A wrapping row of chips. `--lg` for bare facts, which have no borders to separate them | Buttons; that is `kairos-action-row` | `--lg` |
| `kairos-checkbox-row` | A checkbox with its label on one line | A field with a hint | — |
| `kairos-choice-row` | A radio or checkbox with a label and supporting copy | A plain checkbox | — |
| `kairos-visually-hidden` | Text for a screen reader only | Hiding something from everyone; use `hidden` | — |
| `kairos-align-right` | A figure column | Text | — |
| `kairos-nowrap` | A value that must not break | A paragraph | — |
| `kairos-grid-auto` | A tile or card grid, `auto-fit` from `200px`, no media query | Fields; that is `kairos-form-grid` | — |
| `kairos-inline-pair` | A glyph and its label, or a value and its unit, as one unit on a line | A row of siblings; that is `kairos-chip-row` | — |
| `kairos-ruled-row` | A row closed by a rule underneath: a panel heading over its content | Rows inside a list, which rule at the top so the first row does not double | — |
| `kairos-narrow` | A centred `42rem` column, wider than prose and narrower than the page | Prose; that is `kairos-measure` | — |
| `kairos-fit`, `kairos-block` | Width to the content, and width to the container | Height. A control's height comes from its slot | — |
| `kairos-break` | An identifier with no spaces that would otherwise overflow: a URL, a token, an API key | A figure. `kairos-figure` exists because `overflow-wrap` breaks a number into two numbers | — |
| `kairos-body` | A paragraph at body size with prose line height, margin cleared | A table cell, which takes its own | — |
| `kairos-meta` | A muted supporting line at `13px` | The record's own data | — |
| `kairos-label-caps` | A standalone tracked-caps label outside a field | A sentence. Cap it at three words | — |
| `kairos-text-secondary`, `kairos-text-tertiary` | One and two ranks below primary ink | Either, in new code. `kairos-muted` is the documented name for tertiary and `kairos-cell-secondary` for a table cell; these two are the older spellings, kept because Paykit and card both write them | — |
| `kairos-bold`, `kairos-underline`, `kairos-capitalize` | Weight `700`, an underline, and title-casing a value that arrives lowercase | Emphasis by weight where a rank exists. If a label is heavier than its value the ranks are inverted | — |
| `kairos-mono` | An identifier read character by character, in the mono stack | Prose. `kairos-code` is the bordered form for one an operator copies | — |
| `kairos-plain-link` | A link that carries its meaning by position rather than by underline: a card, a nav row, a whole record row | Body copy, where an unmarked link is unfindable | — |
| `kairos-plain-list`, `kairos-bullets` | A list with no markers, and one with them | Rows of records; that is `kairos-record-rows` | — |
| `kairos-flush` | Clearing a margin the element brought with it | Removing a panel's padding, which is `Panel`'s `flush` prop and a different mechanism | — |
| `kairos-mt-md`, `kairos-mb-lg` | A one-off `24px` above or below. **Both resolve to `--kairos-space-xl`, not to `md` or `lg`** — the names are older than the scale and are wrong about it | Spacing a stack; that is `kairos-stack`, which sets one gap and cannot disagree with itself | — |
| `kairos-desktop-only`, `kairos-mobile-only` | Showing something on one side of the `900px` sidebar boundary | The `768px` table-to-card swap, which is `kairos-desktop-table` and `kairos-record-list` | — |
| `kairos-print-only`, `kairos-print-header` | A block that appears on paper only, and the ruled letterhead at the top of it, with `-title`, `-business` and `-meta` | Screen. Nothing in the print header renders in a browser, so it is invisible to every check that is not a print preview | — |
| `kairos-motion-fade-up`, `kairos-motion-fade-in`, `kairos-motion-slide-in-right` | A Brand Scale entrance, `450ms`, decelerating into rest | Product Scale, where a screen full of arriving panels is a screen you wait for | — |

An app that writes its own `.myapp-stack`, `.myapp-muted`, or `.myapp-grow` has
forked one of these. Check this table before adding a class to an app
stylesheet: what belongs to an app is composition wired to its own state, not
spacing, measure, or muted text.

## Not yet built

Claim one by building it. Add its row above in the same change.

| Component | Needed for |
| --- | --- |
| `Textarea` | A named wrapper. `kairos-input-field` already styles a `<textarea>` — its own height, padding and `resize: vertical` — and `Field` takes one today through its render prop, so what is missing is only the component. Left open deliberately: it is not an overlay, and claiming it here would mean this change grew a component for no reason beyond sharing a table row with one. |
| Rendered component tests | The contract tests are static. Nothing here has been rendered by a test runner, because the registry ships no build step — the first app to adopt it is what exercises the JSX. |
| Visual regression | The preview is checked by hand. A screenshot diff per commit would catch what a reviewer will not. |

## Formatters

| Module | Exports | Use for |
| --- | --- | --- |
| `format/money.ts` | `formatMoney`, `formatMinor`, `toMinor`, `fromMinor`, `toMinorOrNull`, `parseAmountFilter` | Every amount a person reads or a form accepts |
| `format/dates.ts` | `formatDate`, `formatDateTime`, `formatTime`, `formatDateRange`, `dateInputHint`, `fromSeconds` | Every date a person reads |

Exact amounts live in integer minor units, never a float. Dates name their
month, because `08/01/2026` is 8 January to a T&T reader and 1 August to a US
one. Both refuse rather than guess: `toMinorOrNull` returns null so a boundary
can turn it into a sentence, and the date formatters return null rather than a
plausible wrong date.

A raw timestamp reaching a screen is a defect. Mailkit's Logs screen printing
`2026-08-26T16:57:10.635982+00:00` to an operator in Trinidad is the case this
module exists to close.

## React

`kairos-design/react`, TypeScript source like everything else. The components emit the classes
above and hold no styling decisions — a `style` prop carrying a colour or a
pixel value into one means the value belongs in the token layer, and a test
fails on it.

| Export | Notes |
| --- | --- |
| `ActionSet` | A screen's actions, declared by role and rendered for the surface. `context` picks the surface — `page`, `dialog`, `row`, `card` — and decides which slots exist, so a row declaring a primary action does not compile. A destructive action carries the string its confirmation reads, and cannot take a ranked slot at all. **Peer dependency: `radix-ui`.** |
| `Select` | The chooser for a list too long for the native control. Past ten options it grows a box that narrows the list as you type, which Radix's own typeahead does not do — typeahead jumps to a match, and jumping inside two hundred tenants is not narrowing to the four that match. Ten or fewer, keep the native `<select>`. **Peer dependency: `radix-ui`.** |
| `Tooltip` | A short explanation on hover or focus. Takes `name` for an icon-only trigger and puts it on the control as `aria-label`, so the control is named whether or not the tooltip ever opens. **Peer dependency: `radix-ui`.** |
| `Popover` | A small panel of content or controls beside the page. Not a menu — nothing in it is a chosen item and using a control inside it does not close it. Not a dialog — it is dismissed by clicking anywhere else, so it is wrong for anything you need an answer to. **Peer dependency: `radix-ui`.** |
| `Button` | Six ranks: `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `dangerSolid`. Defaults to `type="button"`, because an untyped button in a form is a submit button. `loading` puts it mid-request: it keeps its rank and its box, turns the ring, announces itself busy, and swallows every further press — which is what stops a held Enter on a `type="submit"` sending two invoices. `loadingLabel` is what it says while working, and naming the work is the only part of the state that survives reduced motion. Passing either prop, even `loading={false}`, is what reserves the room; a button handed neither renders the markup it always did. |
| `StateChip` | The four states, plus every app's old spelling as a deprecated alias so adoption is not one enormous commit |
| `Segmented` | Filters, wizard steps, the theme choice |
| `InputField`, `Field` | Label, control, hint, and error as one unit, with the empty rows held |
| `Banner` | `alert` for a failure, `status` otherwise |
| `EmptyState` | Takes a `ReactNode` action, not an href: three of the five surfaces have no router |
| `SortHeader`, `SortAnnouncer` | `aria-sort` plus the live region, because a redrawn table announces nothing |
| `OverflowMenu` | The only other control a row carries. Behaviour is Radix `DropdownMenu`: typeahead, arrow keys, Escape returning focus, and a menu that is never clipped by the table panel it opens inside. Placement lives on a wrapper Radix owns, so a rule your stylesheet writes about `.kairos-overflow-menu` styles the menu and cannot move it. A disabled item renders unavailable rather than vanishing; every item disabled renders the trigger unavailable. **Peer dependency: `radix-ui`.** |
| `DataTable` | Table on desktop, record cards below 768px. Sorting, paging, row selection, search and column visibility, all off `columns` plus a prop each. A column declares its role once and that drives the table, the card, and the order. |
| `FilterBar` | The row above a record list that narrows it: a debounced search box and any number of segmented filters, collected into one `FilterState` the screen reads. It narrows nothing itself — what `overdue` means is the screen's. Not for sorting; the table header does that. |
| `CollapsibleCard` | Built on `<details>`, so it works before hydration and prints expanded |
| `compare`, `sortRows`, `nextSort` | The comparator, separately importable and separately tested |
| `Dialog`, `ConfirmDialog` | The destructive gate, at three strengths. A confirmation asks the person to read; `typeToConfirm` asks them to type the record's name; `requireReason` asks them to write down why, and hands both to `onConfirm`. Reach past the first only where the consequence reaches past the screen — a public object deleted for every reader, a key every application is using. **Peer dependency: `radix-ui`.** |
| `CopyField` | A read-only technical value with a copy control beside it. The control is a control at rest, not a hover affordance |
| `confirmationMatches`, `confirmGateOpen` | What a typed confirmation accepts, and whether a gate is answered. Separately importable and separately tested, like `compare` |
| `Toast`, `ToastRegion`, `TransientToast` | Transient confirmation |
| `SectionTag` | The Brand Scale section transition. `as` renders the label as a heading, so a screen reader's heading list can carry the page |
| `Panel` | Border, ground, and `kairos-pad`. `flush` drops the padding for a table that supplies its own |
| `PageHeader` | Title, one-line `description`, and an action group. Pass `ActionSet` to `actions`; `PageHeader` owns the `kairos-page-header-actions` wrapper, so the `page` context renders the controls and nothing around them |
| `Metric`, `MetricRow`, `Skeleton`, `SkeletonStack` | Figures and loading |
| `ThemeToggle`, `ThemeSetting`, `useThemePreference`, `themeInitScript` | The theme control, in both placements |

Radix is the one dependency, and only for what opens over the page. A modal has to trap
focus, restore it, close on Escape, and mark the rest of the page inert; hand
rolling that in a shared component means every Kairos app inherits the same
subtle keyboard trap. Everything else, including the three theme icons, is
inline so that importing one component does not drag a package in with it.

Call `setThemeStorageKey()` once at startup if the app already has a key in its
users' browsers. Paykit's is `paykit.theme`, and changing it silently resets
every existing preference to the device default.

## Deviations

Where the registry departs from the `kairos-branding` skill, and why.

| Deviation | Reason |
| --- | --- |
| State chips take radius `2px`, badges `0` | `SKILL.md` puts badges at `0` and the visual spec puts chips at `2px`. They are different objects: a badge is an eyebrow label, a chip is a status marker. Both values are kept. |
| Inputs take a `2px` border | The visual spec's Shadow Rank block says `1px`; Component Defaults says `2px` and the spec delegates per-component weight to it. |
| Button tracking is `0.14em` | Component Defaults' Product Scale figure. Paykit ships `0.18em` (the Brand Scale value) and Uptime `0.12em`; both are drift. |
| BEM elements use a single dash | Paykit writes both `kairos-page-header-primary` and `kairos-record-card__meta`. The skill's naming convention documents the single-dash form. |
| A form-control reset ships in `kairos.css` | The port assumed Tailwind's preflight. Without it, Chrome paints native widget chrome that only shows on the dark theme. |
